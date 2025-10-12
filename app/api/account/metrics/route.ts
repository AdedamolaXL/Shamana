import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total songs added across all playlists
    const { count: songsAdded, error: songsError } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id);

    // Get number of playlists created
    const { count: playlistsCreated, error: playlistsError } = await supabase
      .from('playlists')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id);

    // Get number of playlists collected as NFT
    const { count: playlistsCollected, error: collectedError } = await supabase
      .from('playlist_collections')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id);

    return NextResponse.json({
      songsAdded: songsAdded || 0,
      playlistsCreated: playlistsCreated || 0,
      playlistsCollected: playlistsCollected || 0
    });

  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}