import { NextResponse } from "next/server";
import { mintNft } from "@/lib/hedera-tokens";
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

    // Verify user has a Hedera account (should exist from signup)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('hedera_account_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.hedera_account_id) {
      return NextResponse.json(
        { error: "User does not have a Hedera account. Please contact support." },
        { status: 400 }
      );
    }

    console.log(`Using recipient account: ${user.hedera_account_id}`);

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
    let finalMetadata = minimalMetadata;
    if (Buffer.byteLength(minimalMetadata, 'utf8') > 100) {
      // If still too long, use just the IPFS hash
      const fallbackMetadata = JSON.stringify({
        ipfs: metadataCid,
        t: "collector"
      });
      
      if (Buffer.byteLength(fallbackMetadata, 'utf8') > 100) {
        // Last resort: just the IPFS hash as a string (no JSON)
        finalMetadata = metadataCid;
        if (Buffer.byteLength(finalMetadata, 'utf8') > 100) {
          throw new Error("Metadata too large even after compression");
        }
      } else {
        finalMetadata = fallbackMetadata;
      }
    }

    // Mint COLLECTOR NFT using the updated mintNft function
    const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
    if (!tokenId) {
      throw new Error("NFT token ID not configured");
    }

    console.log('Minting NFT for collector...');
    const result = await mintNft(tokenId, [Buffer.from(finalMetadata)], userId);

    if (!result.transferResult || result.transferResult.status !== 'SUCCESS') {
      console.error('NFT transfer failed:', result.transferResult);
      return NextResponse.json(
        { error: `NFT minting succeeded but transfer failed: status: ${result.transferResult ? result.transferResult.status : 'UNKNOWN'}` },
        { status: 500 }
      );
    }

    // Record the collection in database
    const { error: collectionError } = await supabase
      .from('playlist_collections')
      .insert({
        playlist_id: playlistId,
        user_id: userId,
        nft_token_id: result.tokenId,
        nft_serial_number: result.serials[0],
        nft_metadata_uri: metadataUri,
        collected_at: new Date().toISOString()
      });

    if (collectionError) {
      console.error("Failed to record collection:", collectionError);
      // Don't fail the entire request since the NFT was successfully minted
    }

    return NextResponse.json({ 
      success: true, 
      serialNumber: result.serials[0],
      metadataUri,
      recipientAccountId: user.hedera_account_id,
      transferStatus: result.transferResult.status,
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