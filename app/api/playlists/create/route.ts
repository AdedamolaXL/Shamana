import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { uploadToIPFS } from "@/lib/ipfs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("🎵 Playlist creation API called");

    const supabase = createRouteHandlerClient({ cookies });
    const { name, description } = await request.json();

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Creating playlist for user (UUID):", session.user.id);

    // --- Create playlist row ---
    const { data: newPlaylist, error } = await supabase
      .from("playlists")
      .insert({
        user_id: session.user.id,
        name,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Playlist creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Playlist created with ID:", newPlaylist.id);

    // Mint NFT if token configured
    const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
    if (!tokenId) {
      console.warn("HEDERA_NFT_TOKEN_ID not set → skipping NFT mint");
      return NextResponse.json(newPlaylist);
    }

    // Playlist metadata for NFT
    const playlistMetadata = {
      name,
      description: description || `A playlist created by ${session.user.email}`,
      attributes: [
        { trait_type: "Creator", value: session.user.id },
        { trait_type: "Playlist Type", value: "User Created" },
        { trait_type: "Song Count", value: 0 },
      ],
    };

    // Upload metadata to IPFS
    const ipfsHash = await uploadToIPFS(playlistMetadata);
    const metadataUri = `ipfs://${ipfsHash}`;

    console.log("Calling NFT mint API...");
    let nftResponse;
    try {
      nftResponse = await fetch(
        new URL("/api/nft/mint", request.url).toString(),
        {
          method: "POST",
          headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "", 
    },
          body: JSON.stringify({
            playlistId: newPlaylist.id,
            metadataUri,
            userId: session.user.id, // UUID
          }),
        }
      );
    } catch (err) {
      console.error("Failed to reach NFT mint API:", err);
      return NextResponse.json(newPlaylist);
    }

    const nftData = await nftResponse.json();
    console.log("NFT API response:", nftData);

    if (nftResponse.ok && nftData.success && nftData.nftResult) {
      // Update playlist with NFT info
      await supabase
        .from("playlists")
        .update({
          nft_token_id: nftData.nftResult.tokenId,
          nft_serial_number: nftData.nftResult.serials[0],
          nft_metadata_uri: metadataUri,
        })
        .eq("id", newPlaylist.id);

      // Add to creator’s collection
      await supabase.from("playlist_collections").insert({
        playlist_id: newPlaylist.id,
        user_id: session.user.id,
        nft_token_id: nftData.nftResult.tokenId,
        nft_serial_number: nftData.nftResult.serials[0],
        nft_metadata_uri: metadataUri,
        collected_at: new Date().toISOString(),
      });

      console.log("🎉 Playlist + NFT minted successfully");
      return NextResponse.json({
        ...newPlaylist,
        nft_token_id: nftData.nftResult.tokenId,
        nft_serial_number: nftData.nftResult.serials[0],
        nft_metadata_uri: metadataUri,
      });
    }

    console.warn("NFT minting failed, returning playlist without NFT");
    return NextResponse.json(newPlaylist);
  } catch (error: any) {
    console.error("Playlist creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
