"use client";

import { SongListProps } from "./types";
import usePlayer from "@/hooks/usePlayer";
import { FaPlus } from "react-icons/fa";

export const SongList: React.FC<SongListProps> = ({ 
  songs, 
  playlist, 
  onPlaySong,
  highlightSong,
}) => {
  const player = usePlayer();

  const handleSongClick = (songId: string, index: number) => {
    if (playlist?.id) {
      // Get playlist songs in the order they appear (most recent first)
      const playlistSongIds = playlist.playlist_songs
        ?.sort((a: any, b: any) => {
          // Sort by added_at timestamp, most recent first
          const dateA = new Date(a.added_at || 0).getTime();
          const dateB = new Date(b.added_at || 0).getTime();
          return dateB - dateA;
        })
        .map((ps: { songs: { id: any; }; }) => ps.songs.id) || [];
      player.setIds(playlistSongIds);
      player.setPlaylistContext(playlist.id);
    }
    
    onPlaySong(songId);
  };

  // Sort playlist_songs by added_at timestamp (most recent first) before displaying
  const sortedPlaylistSongs = playlist?.playlist_songs
    ? [...playlist.playlist_songs].sort((a: any, b: any) => {
        const dateA = new Date(a.added_at || 0).getTime();
        const dateB = new Date(b.added_at || 0).getTime();
        return dateB - dateA; // Most recent first
      })
    : [];

  return (
    <div className="flex flex-col gap-1.5 mb-4 relative z-10">
      {/* Show only first 3 songs */}
      {songs.slice(0, 3).map((song: string, index: number) => {
        const songInPlaylist = sortedPlaylistSongs[index]?.songs;
        const songId = songInPlaylist?.id;
        
        const isCurrentSong = player.activeId === songId;
        const isPlaying = isCurrentSong && player.isPlaying;
        const isHighlighted = highlightSong === songId;
        
        return (
          <div 
            key={index} 
            className={`flex items-center gap-2.5 text-sm 
              transition-all duration-300 hover:text-white hover:bg-white/5 hover:px-2 hover:py-1 hover:rounded
              group-hover:text-gray-200 cursor-pointer group/song
              ${isHighlighted ? 'bg-green-500/10 border-l-2 border-green-500 pl-2' : 'text-gray-300'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (songId) {
                handleSongClick(songId, index);
              }
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (songId) {
                  handleSongClick(songId, index);
                }
              }
            }}
          >
            <div className="relative w-5 flex items-center justify-center">
              {isHighlighted ? (
                <div className="flex items-center gap-1">
                  <FaPlus className="text-green-500 text-xs" />
                </div>
              ) : isCurrentSong && isPlaying ? (
                <i className="fas fa-pause text-[#6a11cb] text-xs"></i>
              ) : (
                <>
                  <span className="text-[#6a11cb] font-medium transition-all duration-300 group-hover/song:opacity-0 group-hover/song:scale-0">
                    {index + 1}
                  </span>
                  
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 scale-50 group-hover/song:opacity-100 group-hover/song:scale-100">
                    <i className="fas fa-play text-[#6a11cb] text-xs"></i>
                  </div>
                </>
              )}
            </div>
            
            <span className={`transition-colors duration-300 truncate flex-1 ${
              isCurrentSong ? 'text-[#6a11cb] font-medium' : 
              isHighlighted ? 'text-green-400 font-medium' : ''
            }`}>
              {song}
            </span>
          </div>
        );
      })}
      {songs.length > 3 && (
        <div className="text-xs text-gray-400 mt-1 transition-colors duration-300 group-hover:text-gray-300">
          +{songs.length - 3} more songs
        </div>
      )}
    </div>
  );
};