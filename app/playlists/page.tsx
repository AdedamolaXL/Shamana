import { getPlaylists } from "@/actions/getPlaylists";
import PageContent from "./components/PageContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PlaylistsPage = async () => {
  const playlists = await getPlaylists();

  return (
    <div className="bg-gradient-to-b from-neutral-900 to-black rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <div className="mb-7 px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">Playlists</h1>
            <p className="text-neutral-400 mt-2">
              {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
            </p>
          </div>
        </div>
        <PageContent playlists={playlists} />
      </div>
    </div>
  );
};

export default PlaylistsPage;