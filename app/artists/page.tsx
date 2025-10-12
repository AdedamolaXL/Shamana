import { getAllArtists } from "@/actions/getAllArtists";
import ArtistsContent from "@/app/artists/components/ArtistContent";

export const dynamic = 'force-dynamic';

const ArtistsPage = async () => {
  const artists = await getAllArtists();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <div className="mb-7 px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">Artists</h1>
            <p className="text-neutral-400 mt-2">
              {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
            </p>
          </div>
        </div>
        <ArtistsContent artists={artists} />
      </div>
    </div>
  );
};

export default ArtistsPage;