// app/api/playlists/[id]/contributors/route.ts
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
      .select('user_id, user:users(username, email)')
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
        user:users(username, email),
        songs(id, title)
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
        userContributions.set(userId, {
          id: userId,
          username: contribution.user?.username || contribution.user?.email?.split('@')[0] || 'Anonymous',
          email: contribution.user?.email || '',
          is_curator: userId === playlist.user_id,
          songs_added: 0,
          songs: []
        });
      }
      
      const userContrib = userContributions.get(userId);
      userContrib.songs_added += 1;
      userContrib.songs.push({
        id: contribution.songs?.id,
        title: contribution.songs?.title
      });
    });

    // Ensure the original curator is included even if they haven't added songs yet
    if (playlist.user_id && !userContributions.has(playlist.user_id)) {
      userContributions.set(playlist.user_id, {
        id: playlist.user_id,
        username: playlist.user?.username || playlist.user?.email?.split('@')[0] || 'Anonymous',
        email: playlist.user?.email || '',
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