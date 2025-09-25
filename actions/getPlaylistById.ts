import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";
import { notFound } from "next/navigation";

export const getPlaylistById = async (id: string): Promise<PlaylistWithSongs> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  // Get playlist WITH user information and songs
  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select(`
      *,
      user:users (username, email),
      playlist_songs (
        id,
        position,
        songs (*)
      )
    `)
    .eq('id', id)
    .single();

  if (playlistError || !playlistData) {
    console.log("Playlist not found error:", playlistError?.message);
    notFound();
  }

  // Return with the correct PlaylistWithSongs structure
  return playlistData as PlaylistWithSongs;
};
