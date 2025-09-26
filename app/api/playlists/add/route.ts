import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { playlistId, songId } = await request.json();

    console.log('Adding song to playlist:', { playlistId, songId });

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get playlist details
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('id, user_id, nft_token_id')
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check if song is already in playlist
    const { data: existingEntry } = await supabase
      .from('playlist_songs')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .single();

    if (existingEntry) {
      return NextResponse.json({ error: 'Song is already in the playlist' }, { status: 400 });
    }

    // Get the current max position
    const { data: maxPositionData } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPositionData ? maxPositionData.position + 1 : 0;

    // Add the song to the playlist
    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition,
        user_id: session.user.id
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ AUTO-COLLECT: Check if user should automatically collect this playlist
    if (playlist.nft_token_id && playlist.user_id !== session.user.id) {
      
      // Check if user has already collected this playlist
      const { data: existingCollection } = await supabase
        .from('playlist_collections')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', session.user.id)
        .single();

      if (!existingCollection) {
        console.log('Auto-collecting playlist for user:', session.user.id);
        
        // Call the existing NFT collection API
        const collectResponse = await fetch(new URL('/api/nft/collect', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playlistId: playlistId,
            userId: session.user.id,
            userEmail: session.user.email
          }),
        });

        if (collectResponse.ok) {
          console.log('Playlist auto-collected successfully');
        } else {
          console.warn('Auto-collection failed, but song was added');
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Song added to playlist' 
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}