import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Artist } from "@/types"

const useLoadArtistImage = (artist: Artist) => {
  const supabaseClient = useSupabaseClient();

  if (!artist?.image_path) {
    return null;
  }

  const { data: imageData } = supabaseClient.storage
    .from('pli5t-images')
    .getPublicUrl(artist.image_path);

  return imageData.publicUrl;
};

export default useLoadArtistImage;