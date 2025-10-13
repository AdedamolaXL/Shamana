import getSongs from "@/actions/getSongs";
import { getPlaylists } from "@/actions/getPlaylists";
import { getAllArtists } from "@/actions/getAllArtists";
import LibraryContent from "./components/LibraryContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LibraryPage = async () => {
  // Fetch all data in parallel
  const [songs, playlists, artists] = await Promise.all([
    getSongs(),
    getPlaylists(),
    getAllArtists()
  ]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <div className="mb-7 px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">Your Library</h1>
            <p className="text-neutral-400 mt-2">
              {songs.length} songs • {playlists.length} playlists • {artists.length} artists
            </p>
          </div>
        </div>
        <LibraryContent 
          songs={songs} 
          playlists={playlists} 
          artists={artists} 
        />
      </div>
    </div>
  );
};

export default LibraryPage;