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

  // First get the playlist song relationships
  const { data: playlistSongsData, error: playlistSongsError } = await supabase
    .from('playlist_songs')
    .select('song_id, position')
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  console.log("Playlist songs relationship result:", { playlistSongsData, playlistSongsError });

  if (playlistSongsError) {
    console.log("Playlist songs error:", playlistSongsError.message);
    // Return playlist with empty songs array if we can't fetch the relationships
    return {
      ...playlistData,
      songs: []
    };
  }

  // If there are no songs in the playlist, return early
  if (!playlistSongsData || playlistSongsData.length === 0) {
    return {
      ...playlistData,
      songs: []
    };
  }

  // Extract song IDs from the relationships
  const songIds = playlistSongsData.map(ps => ps.song_id);

  // Fetch the actual song data
  const { data: songsData, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .in('id', songIds);

  console.log("Songs query result:", { songsData, songsError });

  if (songsError) {
    console.log("Songs error:", songsError.message);
    // Return playlist with empty songs array if we can't fetch the songs
    return {
      ...playlistData,
      songs: []
    };
  }

  // Sort songs by their position in the playlist
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