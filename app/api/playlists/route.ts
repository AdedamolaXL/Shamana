import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabase
    .from("playlists")
    .select(`
      id,
      name,
      created_at,
      playlist_songs(
        id,
        position,
        songs(*)
      )
    `);

    if (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    const normalized = (data || []).map((playlist: any) => ({
    ...playlist,
    // Flatten playlist_songs into a songs array
    songs: (playlist.playlist_songs || [])
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((ps: any) => ({
        ...ps.songs,
        position: ps.position,        // keep ordering info
        playlistSongId: ps.id         // optional: preserve join row id
      }))
  }));

    return NextResponse.json({ success: true, data: normalized || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}