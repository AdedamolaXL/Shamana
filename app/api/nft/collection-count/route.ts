import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlistId");

    if (!playlistId) {
      return NextResponse.json({ error: "Missing playlistId" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the exact count of collections for this playlist
    const { count, error } = await supabase
      .from("playlist_collections")
      .select("*", { count: "exact" })
      .eq("playlist_id", playlistId);

    if (error) {
      console.error("Error fetching collection count:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching collection count:", error);
    return NextResponse.json({ count: 0 });
  }
}