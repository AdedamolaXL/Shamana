"use client";

import { Song } from "@/types";
import { PlaylistContributors } from "./PlaylistContributors";

interface PlaylistSidebarProps {
  availableSongs: Song[];
  onAddToPlaylist: (songId: string) => void;
  isAdding: string | null;
  playlistId: string;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  availableSongs,
  onAddToPlaylist,
  isAdding,
  playlistId
}) => {
  const formatDuration = (seconds: number = 0): string => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#111] rounded-xl p-5">
      <h3 className="text-[1.2rem] font-semibold mb-[15px]">Song Queue</h3>
      <div className="mb-[25px]">
        {availableSongs.slice(0, 16).map((song, i) => (
          <div key={song.id} className="flex items-center gap-[10px] py-2 border-b border-[#222] last:border-none">
            <div className="flex-1">
              <div className="text-[0.9rem] font-medium">
                {song.title}
              </div>
              <div className="text-[0.8rem] text-[#999]">{song.author}</div>
            </div>
            <span className="text-[0.8rem] text-[#999]">
              {formatDuration(song.duration)}
            </span>
            <button
              className="text-sm text-[#6a11cb] hover:text-white transition-colors"
              onClick={() => onAddToPlaylist(song.id)}
              disabled={isAdding === song.id}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        ))}
        {availableSongs.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No songs available to add</p>
        )}
      </div>

      <PlaylistContributors playlistId={playlistId} />
    </div>
  );
};