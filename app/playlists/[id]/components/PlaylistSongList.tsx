"use client";

import { PlaylistWithSongs } from "@/types";
import { FaMusic, FaHeart, FaPlus } from "react-icons/fa";

interface PlaylistSongListProps {
  playlist: PlaylistWithSongs;
  onSongClick: (songId: string) => void;
  formatDuration: (seconds?: number) => string;
}

export const PlaylistSongList: React.FC<PlaylistSongListProps> = ({
  playlist,
  onSongClick,
  formatDuration
}) => {
  return (
    <div className="flex flex-col">
      {playlist.playlist_songs?.map((playlistSong, index) => (
        <div 
          key={playlistSong.songs.id} 
          className="flex items-center gap-4 py-3 px-2 cursor-pointer border-b border-[#222] hover:bg-[#1a1a1a] transition"
          onClick={() => onSongClick(playlistSong.songs.id)}
        >
          <span className="w-6 text-sm text-gray-400">{index + 1}</span>
          <div className="flex-1">
            <div className="text-sm font-medium">{playlistSong.songs.title}</div>
            <div className="text-xs text-gray-500">{playlistSong.songs.author}</div>
          </div>
          <span className="text-xs text-gray-400">
            {formatDuration(playlistSong.songs.duration)}
          </span>
          <div className="flex items-center gap-2 ml-4">
            <button className="text-gray-400 hover:text-white transition">
              <FaHeart className="far" />
            </button>
            <button className="text-gray-400 hover:text-white transition">
              <FaPlus />
            </button>
          </div>
        </div>
      ))}
      {(!playlist.playlist_songs || playlist.playlist_songs.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          <FaMusic className="mx-auto mb-2 text-2xl" />
          <p>No songs in this playlist yet</p>
          <p className="text-sm">Be the first to add songs!</p>
        </div>
      )}
    </div>
  );
};