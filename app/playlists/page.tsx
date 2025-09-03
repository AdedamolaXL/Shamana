// app/playlists/page.tsx
import { getPlaylists } from "@/actions/getPlaylists";
import Header from "@/components/Header";
import PageContent from "./components/PageContent";

export const revalidate = 0;

const PlaylistsPage = async () => {
  const playlists = await getPlaylists();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">Playlists</h1>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <PageContent playlists={playlists} />
      </div>
    </div>
  );
};

export default PlaylistsPage;