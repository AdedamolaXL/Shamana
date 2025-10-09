import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getPlaylists } from "@/actions/getPlaylists";
import getSongs from "@/actions/getSongs";
import HomeClient from "./components/HomeClient";

export const revalidate = 0;

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const allPlaylists = await getPlaylists();
  const allSongs = await getSongs();

  // Sort playlists by creation date (newest first)
  const sortedPlaylists = [...allPlaylists].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  return (
    <HomeClient 
      session={session}
      initialPlaylists={sortedPlaylists}
      initialSongs={allSongs}
    />
  );
}