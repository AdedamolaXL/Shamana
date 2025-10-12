import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Artist } from "@/types";

export const getArtistByName = async (name: string): Promise<Artist | null> => {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      artist_songs(
        songs(*)
      )
    `)
    .eq('name', name)
    .single();

  if (error || !data) {
    return null;
  }

  // Transform the data to match Artist interface
  const artist: Artist = {
    ...data,
    songs: data.artist_songs?.map((as: any) => as.songs).filter(Boolean) || [],
    total_songs: data.artist_songs?.length || 0
  };

  return artist;
};