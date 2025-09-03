import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Song } from "@/types"

const useLoadImage = (song: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song?.image_path) {
    return "/images/default-song.png";
  }

  const { data: imageData } = supabaseClient.storage
    .from('pli5t-images')
    .getPublicUrl(song.image_path);

  return imageData.publicUrl || "/images/default-song.png";
};

export default useLoadImage;