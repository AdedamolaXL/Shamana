import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";
import { notFound } from "next/navigation";

export const getPlaylistById = async (id: string): Promise<PlaylistWithSongs> => {
  console.log("Fetching playlist with ID:", id);
  
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  console.log("Playlist query result:", { playlistData, playlistError });

  if (playlistError || !playlistData) {
    console.log("Playlist not found error:", playlistError?.message);
    notFound();
  }

  const { data: songsData, error: songsError } = await supabase
    .from('playlist_songs')
    .select(`
      song: songs (*)
    `)
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  console.log("Songs query result:", { songsData, songsError });

  if (songsError) {
    console.log("Songs error:", songsError.message);
  }

  return {
    ...playlistData,
    songs: songsData ? songsData.map(item => item.song) : []
  };
};