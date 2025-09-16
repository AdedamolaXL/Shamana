import { getPlaylists } from "@/actions/getPlaylists";
import PageContent from "./components/PageContent";

export const dynamic = 'force-dynamic';

export const revalidate = 0;

const PlaylistsPage = async () => {
  const playlists = await getPlaylists();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      
      <div className="mt-2 mb-7 px-6">
        <PageContent playlists={playlists} />
      </div>
    </div>
  );
};

export default PlaylistsPage;