'use server';

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const addToPlaylist = async (playlistId: string, songId: string): Promise<void> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Unauthorized");

  // Get the current max position in the playlist
  const { data: maxPositionData, error: maxError } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = maxPositionData ? maxPositionData.position + 1 : 0;

  const { error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition,
      user_id: session.user.id 
    });

  if (error) {
    console.log(error.message);
    throw new Error('Failed to add song to playlist');
  }
};