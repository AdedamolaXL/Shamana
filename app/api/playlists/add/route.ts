import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { playlistId, songId } = await request.json();

    console.log('Adding song to playlist:', { playlistId, songId });

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current max position in the playlist
    const { data: maxPositionData, error: maxError } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPositionData ? maxPositionData.position + 1 : 0;

    const { data: existingEntry, error: checkError } = await supabase
      .from('playlist_songs')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .single();

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Song is already in the playlist' },
        { status: 400 }
      );
    }
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for duplicates' },
        { status: 500 }
      );
    }

    // Add the song to the playlist with user_id
    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition,
        user_id: session.user.id // Store the user who added the song
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}