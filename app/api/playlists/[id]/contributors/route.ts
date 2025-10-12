import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Context {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: Context) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: playlistId } = context.params;

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    // Get playlist to identify the original curator
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        user_id, 
        users!playlists_user_id_fkey (
          username, 
          email
        )
      `)
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      console.error('Error fetching playlist:', playlistError);
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Get all playlist_songs with user information
    const { data: songContributions, error: contributionsError } = await supabase
      .from('playlist_songs')
      .select(`
        user_id,
        users!playlist_songs_user_id_fkey (
          username, 
          email
        ),
        songs!playlist_songs_song_id_fkey (
          id, 
          title
        )
      `)
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: true });

    if (contributionsError) {
      console.error('Error fetching contributions:', contributionsError);
      return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
    }

    // Count songs added by each user and collect user info
    const userContributions = new Map();

    // Process each song contribution
    songContributions?.forEach(contribution => {
      const userId = contribution.user_id;
      
      if (!userContributions.has(userId)) {
        // Extract user data - handle both array and object cases
        const userData = Array.isArray(contribution.users) 
          ? contribution.users[0] 
          : contribution.users;
        
        const username = userData?.username || 
                        (userData?.email ? userData.email.split('@')[0] : 'Anonymous');
        
        userContributions.set(userId, {
          id: userId,
          username: username,
          email: userData?.email || '',
          is_curator: userId === playlist.user_id,
          songs_added: 0,
          songs: []
        });
      }
      
      const userContrib = userContributions.get(userId);
      userContrib.songs_added += 1;
      
      // Extract song data - handle both array and object cases
      const songData = Array.isArray(contribution.songs)
        ? contribution.songs[0]
        : contribution.songs;
      
      userContrib.songs.push({
        id: songData?.id,
        title: songData?.title
      });
    });

    // Ensure the original curator is included even if they haven't added songs yet
    if (playlist.user_id && !userContributions.has(playlist.user_id)) {
      // Handle both array and object cases for curator data
      const curatorData = Array.isArray(playlist.users)
        ? playlist.users[0]
        : playlist.users;
      
      const curatorUsername = curatorData?.username || 
                             (curatorData?.email ? curatorData.email.split('@')[0] : 'Anonymous');
      
      userContributions.set(playlist.user_id, {
        id: playlist.user_id,
        username: curatorUsername,
        email: curatorData?.email || '',
        is_curator: true,
        songs_added: 0,
        songs: []
      });
    }

    const contributors = Array.from(userContributions.values())
      .sort((a, b) => {
        // Sort curator first, then by number of songs added (descending)
        if (a.is_curator && !b.is_curator) return -1;
        if (!a.is_curator && b.is_curator) return 1;
        return b.songs_added - a.songs_added;
      });

    console.log('Contributors found:', contributors.map(c => ({
      username: c.username,
      songs_added: c.songs_added,
      is_curator: c.is_curator
    })));

    return NextResponse.json({ contributors });
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}