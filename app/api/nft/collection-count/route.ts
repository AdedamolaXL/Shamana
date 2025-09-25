// app/api/nft/collection-count/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlistId");

    if (!playlistId) {
      return NextResponse.json({ error: "Missing playlistId" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    let count = 0;
    try {
      const { data, error, count: collectionCount } = await supabase
        .from("playlist_collections")
        .select("id", { count: "exact" })
        .eq("playlist_id", playlistId);

      if (error) {
        console.warn("Error fetching collection count:", error);
        count = 0;
      } else {
        count = collectionCount || 0;
      }
    } catch (error) {
      console.warn("Playlist collections table might not exist, using count 0");
      count = 0;
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching collection count:", error);
    return NextResponse.json({ count: 0 });
  }
}