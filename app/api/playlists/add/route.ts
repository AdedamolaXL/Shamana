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
     const { data: newPlaylistSong, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition,
        user_id: session.user.id  
      })
      .select(`
        *,
        user:users(username, email)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Song added by user:', session.user.id);

    const updateEarningsRecord = async (playlistId: string, userId: string) => {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current contribution count for this user
    const { data: existingEarnings } = await supabase
      .from('playlist_earnings')
      .select('songs_contributed')
      .eq('user_id', userId)
      .eq('playlist_id', playlistId)
      .single();

    const newContributionCount = (existingEarnings?.songs_contributed || 0) + 1;

    // Upsert earnings record
    await supabase
      .from('playlist_earnings')
      .upsert({
        user_id: userId,
        playlist_id: playlistId,
        songs_contributed: newContributionCount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,playlist_id'
      });

    console.log(`Updated earnings record: user ${userId} now has ${newContributionCount} contributions to playlist ${playlistId}`);
  } catch (error) {
    console.error("Error updating earnings record:", error);
    // Don't fail the entire request if earnings tracking fails
  }
};

    // Call this after successful song addition
    await updateEarningsRecord(playlistId, session.user.id);



    const autoCollectPlaylist = async (playlistId: string, userId: string, userEmail: string) => {
      try {
        console.log(`Attempting auto-collection for user ${userId} on playlist ${playlistId}`);
    
        const collectResponse = await fetch(new URL('/api/nft/collect', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playlistId: playlistId,
            userId: userId,
            userEmail: userEmail
          }),
        });

        if (collectResponse.ok) {
          const result = await collectResponse.json();
          console.log('🎉 Playlist auto-collected successfully:', result);
          return { success: true, data: result };
        } else {
          const error = await collectResponse.json();
          console.warn('Auto-collection failed:', error);
          return { success: false, error };
        }
      } catch (error) {
        console.error('Auto-collection error:', error);
        return { success: false, error };
      }
    };


    // Check if user should automatically collect this playlist
    if (playlist.nft_token_id && playlist.user_id !== session.user.id) {
  // Check if user has already collected this playlist
  const { data: existingCollection } = await supabase
    .from('playlist_collections')
    .select('id, collected_at')
    .eq('playlist_id', playlistId)
    .eq('user_id', session.user.id)
    .single();

  if (!existingCollection) {
    // Use setTimeout to make it non-blocking
    setTimeout(async () => {
      const collectionResult = await autoCollectPlaylist(
        playlistId, 
        session.user.id, 
        session.user.email || ''
      );
      
      if (collectionResult.success) {
        // Optional: Send a toast notification to the user
        console.log('User automatically collected the playlist NFT');
      }
    }, 1000); 
  }
}
  

    return NextResponse.json({ 
      success: true, 
      message: 'Song added to playlist',
      addedBy: newPlaylistSong.user
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}