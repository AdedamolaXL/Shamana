"use client";
import { SongListProps } from "./types";

export const SongList: React.FC<SongListProps> = ({ 
  songs, 
  playlist, 
  onPlaySong 
}) => {
  return (
    <div className="flex flex-col gap-1.5 mb-4 relative z-10">
      {songs.slice(0, 3).map((song: string, index: number) => {
        const songInPlaylist = playlist?.playlist_songs?.[index]?.songs;
        const songId = songInPlaylist?.id;
        
        return (
          <div 
            key={index} 
            className="flex items-center gap-2.5 text-sm text-gray-300 
              transition-all duration-300 hover:text-white hover:bg-white/5 hover:px-2 hover:py-1 hover:rounded
              group-hover:text-gray-200 cursor-pointer group/song"
            onClick={(e) => {
              e.stopPropagation();
              if (songId) {
                onPlaySong(songId);
              }
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (songId) {
                  onPlaySong(songId);
                }
              }
            }}
          >
            <div className="relative w-5 flex items-center justify-center">
              <span className="text-[#6a11cb] font-medium transition-all duration-300 group-hover/song:opacity-0 group-hover/song:scale-0">
                {index + 1}
              </span>
              
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 scale-50 group-hover/song:opacity-100 group-hover/song:scale-100">
                <i className="fas fa-play text-[#6a11cb] text-xs"></i>
              </div>
            </div>
            
            <span className="transition-colors duration-300 truncate flex-1">{song}</span>
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