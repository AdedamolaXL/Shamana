import { getPlaylistById } from "@/actions/getPlaylistById";
import getSongs from "@/actions/getSongs";
import PlaylistPageClient from "./PlaylistPageClient";

interface PlaylistPageProps {
  params: {
    id: string;
  }
}

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const playlist = await getPlaylistById(params.id);
  const allSongs = await getSongs(); // Fetch all songs for the library

  return <PlaylistPageClient playlist={playlist} allSongs={allSongs} />;
};

export default PlaylistPage;