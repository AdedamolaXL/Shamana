"use client"
import { Artist } from "@/types";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import useLoadArtistImage from "@/hooks/useLoadArtistImage";

interface ArtistsContentProps {
  artists: Artist[];
}

// Create a separate component that uses the hook
interface ArtistItemProps {
  artist: Artist;
}

const ArtistItem: React.FC<ArtistItemProps> = ({ artist }) => {
  const router = useRouter();
  const imageUrl = useLoadArtistImage(artist); // Hook called at top level

  return (
    <div
      onClick={() => router.push(`/artists/${encodeURIComponent(artist.name)}`)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square rounded-full overflow-hidden bg-neutral-800 mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaUser size={48} className="text-neutral-400" />
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
          {artist.name}
        </h3>
        <p className="text-neutral-400 text-sm mt-1">
          {artist.total_songs || 0} {artist.total_songs === 1 ? 'song' : 'songs'}
        </p>
      </div>
    </div>
  );
};

export const ArtistsContent: React.FC<ArtistsContentProps> = ({ artists }) => {
  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <div className="bg-neutral-800/50 rounded-full p-6 mb-4">
          <FaUser size={48} className="text-neutral-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No artists yet</h3>
        <p className="text-neutral-500 text-center max-w-md">
          Artists will appear here when songs are uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {artists.map((artist) => (
        <ArtistItem key={artist.id} artist={artist} />
      ))}
    </div>
  );
};

export default ArtistsContent;