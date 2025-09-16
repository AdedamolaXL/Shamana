import { getPlaylistById } from "@/actions/getPlaylistById";
import PlaylistPageClient from "./PlaylistPageClient";

interface PlaylistPageProps {
  params: {
    id: string;
  }
}

export const dynamic = 'force-dynamic';

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const playlist = await getPlaylistById(params.id);

  return <PlaylistPageClient playlist={playlist} />;
};

export default PlaylistPage;