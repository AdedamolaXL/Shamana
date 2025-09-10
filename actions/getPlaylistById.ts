import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistWithSongs } from "@/types";
import { notFound } from "next/navigation";

export const getPlaylistById = async (id: string): Promise<PlaylistWithSongs> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  // Get playlist (now publicly accessible)
  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  if (playlistError || !playlistData) {
    console.log("Playlist not found error:", playlistError?.message);
    notFound();
  }

  // Get playlist songs (public access)
  const { data: playlistSongsData, error: playlistSongsError } = await supabase
    .from('playlist_songs')
    .select('song_id, position')
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  if (playlistSongsError) {
    console.log("Playlist songs error:", playlistSongsError.message);
    return {
      ...playlistData,
      songs: []
    };
  }

  if (!playlistSongsData || playlistSongsData.length === 0) {
    return {
      ...playlistData,
      songs: []
    };
  }

  const songIds = playlistSongsData.map(ps => ps.song_id);

  const { data: songsData, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .in('id', songIds);

  if (songsError) {
    console.log("Songs error:", songsError.message);
    return {
      ...playlistData,
      songs: []
    };
  }

  const sortedSongs = songsData
    ? songsData.sort((a, b) => {
        const aPos = playlistSongsData.find(ps => ps.song_id === a.id)?.position || 0;
        const bPos = playlistSongsData.find(ps => ps.song_id === b.id)?.position || 0;
        return aPos - bPos;
      })
    : [];

  return {
    ...playlistData,
    songs: sortedSongs
  };
};