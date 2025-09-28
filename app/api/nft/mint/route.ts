import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { mintNft } from "@/lib/hedera-tokens";

export async function POST(req: Request) {
  try {
    const { playlistId, metadataUri, userId } = await req.json();

    if (!playlistId || !metadataUri || !userId) {
      return NextResponse.json(
        { error: "Missing playlistId, metadataUri, or userId" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 👇 Mint NFT
    const nftResult = await mintNft(
      process.env.HEDERA_NFT_TOKEN_ID!,
      [Buffer.from(metadataUri)],
      userId
    );

    // Create collection record
    const { data, error } = await supabase
      .from("playlist_collections")
      .insert({
        user_id: user.id, // UUID of creator/collector
        playlist_id: playlistId,
        nft_token_id: nftResult.tokenId,
        nft_serial_number: nftResult.serials[0],
        nft_metadata_uri: metadataUri,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create collection record:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, nftResult, collection: data });
  } catch (error: any) {
    console.error("NFT minting error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
