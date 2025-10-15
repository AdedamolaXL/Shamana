import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";
import { notFound } from "next/navigation";

export const getPlaylistById = async (id: string): Promise<PlaylistWithSongs> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  // Get playlist WITH user information and songs - ordered by most recent first
  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select(`
      *,
      user:users (username, email),
      playlist_songs (
        id,
        position,
        added_at,
        songs (*)
      )
    `)
    .eq('id', id)
    .order('added_at', { 
      foreignTable: 'playlist_songs', 
      ascending: false // Most recent first
    })
    .single();

  if (playlistError || !playlistData) {
    console.log("Playlist not found error:", playlistError?.message);
    notFound();
  }

  return playlistData as PlaylistWithSongs;
};