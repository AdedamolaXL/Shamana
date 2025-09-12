import { getPlaylistById } from "@/actions/getPlaylistById";
import getSongs from "@/actions/getSongs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import CuratePageClient from "./CuratePageClient";

interface CuratePageProps {
  params: {
    id: string;
  }
}

export default async function CuratePage({ params }: CuratePageProps) {
  const playlist = await getPlaylistById(params.id);
  const allSongs = await getSongs();
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return <CuratePageClient playlist={playlist} allSongs={allSongs} session={session} />;
}