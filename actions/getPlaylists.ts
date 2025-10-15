import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";

export const getPlaylists = async (): Promise<PlaylistWithSongs[]> => {
  const supabase = createServerComponentClient({cookies: cookies});

  // Get all playlists with user information - songs ordered by most recent
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      user:users (username, email),
      playlist_songs (
        position,
        added_at,
        songs (*)
      )
    `)
    .order('created_at', { ascending: false })
    .order('added_at', { 
      foreignTable: 'playlist_songs', 
      ascending: false // Most recent song first
    });

  if (error) {
    console.log('Error fetching playlists:', error.message);
    return [];
  }

  return data as PlaylistWithSongs[];
};