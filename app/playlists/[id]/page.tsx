import { getPlaylistById } from "@/actions/getPlaylistById";
import Image from "next/image";
import PlaylistContent from "../components/PlaylistContent";

interface PlaylistPageProps {
  params: {
    id: string;
  }
}

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const playlist = await getPlaylistById(params.id);

  
  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center gap-x-5">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image 
                fill
                src={playlist.image_path || "/images/playlist.png"}
                alt="Playlist"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">Playlist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-neutral-400 text-sm">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
        </div>
      <PlaylistContent songs={playlist.songs} />
    </div>
  );
};

export default PlaylistPage;