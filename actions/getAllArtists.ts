import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Artist } from "@/types";

export const getAllArtists = async (): Promise<Artist[]> => {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      artist_songs(
        songs(*)
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching artists:', error);
    return [];
  }

  return (data || []).map(artist => ({
    ...artist,
    songs: artist.artist_songs?.map((as: any) => as.songs) || [],
    total_songs: artist.artist_songs?.length || 0
  })) as Artist[];
};