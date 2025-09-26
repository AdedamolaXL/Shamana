import { NextResponse } from "next/server";
import { mintNft, activateAndGetRecipientAccount } from "@/lib/hedera-tokens";
import { uploadToIPFS } from "@/lib/ipfs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { playlistId, userId, userEmail } = await req.json();

    if (!playlistId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get playlist with creator info
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        user:users (id, username),
        playlist_songs (
          position,
          songs (title, author)
        )
      `)
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (!playlist.nft_token_id) {
      return NextResponse.json(
        { error: "Playlist must have a creator NFT before it can be collected" },
        { status: 400 }
      );
    }

    if (playlist.user_id === userId) {
      return NextResponse.json(
        { error: "You cannot collect your own playlist" },
        { status: 400 }
      );
    }

    const { data: existingCollection } = await supabase
      .from('playlist_collections')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', userId)
      .single();

    if (existingCollection) {
      return NextResponse.json(
        { error: "You have already collected this playlist" },
        { status: 400 }
      );
    }

    // ✅ ACTIVATE USER'S HEDERA ACCOUNT BEFORE MINTING
    console.log(`Activating Hedera account for user: ${userId}`);
    let recipientAccount;
    try {
      recipientAccount = await activateAndGetRecipientAccount(userId);
      console.log('Account activation result:', recipientAccount);
    } catch (activationError) {
      console.error('Failed to activate Hedera account:', activationError);
      const errorMessage = (activationError && typeof activationError === "object" && "message" in activationError)
        ? (activationError as { message: string }).message
        : String(activationError);
      return NextResponse.json(
        { error: `Failed to activate Hedera account: ${errorMessage}` },
        { status: 500 }
      );
    }

    const recipientAccountId = typeof recipientAccount === "string" 
      ? recipientAccount 
      : recipientAccount.accountId;

    console.log(`Using recipient account: ${recipientAccountId}`);

    // Create COLLECTOR-specific metadata
    const metadata = {
      name: `${playlist.name} - Collector Edition`,
      description: `Collected version of "${playlist.name}" curated by ${playlist.user?.username || 'the community'}`,
      image: playlist.image_path || "ipfs://Qmdefaultimage",
      attributes: [
        {
          trait_type: "Collector",
          value: userId
        },
        {
          trait_type: "Original Creator", 
          value: playlist.user_id
        },
        {
          trait_type: "Song Count",
          value: playlist.playlist_songs?.length || 0
        },
        {
          trait_type: "Collection Type",
          value: "Community Collected"
        }
      ],
      original_playlist: {
        id: playlistId,
        name: playlist.name,
        creator: playlist.user?.username || 'Unknown'
      }
    };

    // Upload metadata to IPFS
    const metadataCid = await uploadToIPFS(metadata);
    const metadataUri = `ipfs://${metadataCid}`;

    // Create MINIMAL metadata for Hedera (under 100 bytes) - JUST THE IPFS URI
    const minimalMetadata = JSON.stringify({
      uri: metadataUri,
      type: "playlist_collector"
    });

    // Check if metadata exceeds 100 bytes
    if (Buffer.byteLength(minimalMetadata, 'utf8') > 100) {
      // If still too long, use just the IPFS hash
      const fallbackMetadata = JSON.stringify({
        ipfs: metadataCid,
        t: "collector"
      });
      
      if (Buffer.byteLength(fallbackMetadata, 'utf8') > 100) {
        // Last resort: just the IPFS hash as a string (no JSON)
        const finalMetadata = metadataCid;
        if (Buffer.byteLength(finalMetadata, 'utf8') > 100) {
          throw new Error("Metadata too large even after compression");
        }
      }
    }

    // Mint COLLECTOR NFT
    const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
    if (!tokenId) {
      throw new Error("NFT token ID not configured");
    }

    const result = await mintNft(tokenId, [Buffer.from(minimalMetadata)], recipientAccountId);

    // Record the collection in database
    const { error: collectionError } = await supabase
      .from('playlist_collections')
      .insert({
        playlist_id: playlistId,
        user_id: userId,
        nft_token_id: result.tokenId,
        nft_serial_number: result.serials[0],
        collected_at: new Date().toISOString()
      });

    if (collectionError) {
      console.error("Failed to record collection:", collectionError);
    }

    return NextResponse.json({ 
      success: true, 
      serialNumber: result.serials[0],
      metadataUri,
      accountActivated: true,
      recipientAccountId,
      ...result 
    });
  } catch (err: any) {
    console.error("Playlist collection NFT minting error:", err);
    return NextResponse.json(
      { error: err.message || "Playlist collection failed" },
      { status: 500 }
    );
  }
}