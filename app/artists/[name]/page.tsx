import { getArtistByName } from "@/actions/getArtistByName";
import { notFound } from "next/navigation";
import ArtistPageClient from "@/app/artists/[name]/components/ArtistPageClient";

interface ArtistPageProps {
  params: {
    name: string;
  }
}

export async function generateMetadata({ params }: ArtistPageProps) {
  const artistName = decodeURIComponent(params.name);
  const artist = await getArtistByName(artistName);

  return {
    title: artist ? `${artist.name} - Shamana` : 'Artist Not Found',
    description: artist ? `Listen to music by ${artist.name} on Shamana` : 'Artist page',
  };
}

const ArtistPage = async ({ params }: ArtistPageProps) => {
  const artistName = decodeURIComponent(params.name);
  const artist = await getArtistByName(artistName);

  if (!artist) {
    notFound();
  }

  return <ArtistPageClient artist={artist} />;
};

export default ArtistPage;