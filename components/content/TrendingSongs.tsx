"use client";

import { Song } from "@/types";
import { MediaItem } from "@/components";
import useOnPlay from "@/hooks/useOnPlay";

interface TrendingSongsProps {
  songs: Song[];
}

const TrendingSongs: React.FC<TrendingSongsProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-6">Trending Songs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map((song) => (
          <MediaItem 
            key={song.id} 
            data={song} 
            onClick={(id: string) => onPlay(id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingSongs;