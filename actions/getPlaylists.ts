import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";

export const getPlaylists = async (): Promise<PlaylistWithSongs[]> => {
  const supabase = createServerComponentClient({cookies: cookies});

  // Get all playlists with user information
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      user:users (username, email),
      playlist_songs (
        position,
        songs (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('Error fetching playlists:', error.message);
    return [];
  }

  return data as PlaylistWithSongs[];
};