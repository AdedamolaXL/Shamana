"use client";
import Image from "next/image";
import { ActivityCardProps } from "./types";
import { AnimatedGradientBackground } from "@/app/(site)/components/shared/AnimationGradientBackground";
import { WaveformThumbnail } from "./WaveFormThumbnail";
import { SongList } from "./SongList";

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  onPlaylistClick,
  onPlaySong,
  onPlaylistPlay,
  isPlaylistPlaying,
}) => {
  const gradientIndex = index % 10;
  const playlistId = activity.playlist?.id;
  const isPlaying = playlistId ? isPlaylistPlaying(playlistId) : false;

  // Function to handle play button click
  const handlePlayButtonClick = () => {
    if (playlistId) {
      const firstSong = activity.playlist?.playlist_songs?.[0]?.songs;
      if (firstSong?.id) {
        onPlaylistPlay(playlistId, firstSong.id);
      }
    }
  };

  return (
    <div 
      className="bg-[#1a1a1a] rounded-xl p-5 mb-5 
        transition-all duration-300 hover:bg-[#222] hover:shadow-xl hover:shadow-purple-500/10
        focus-within:bg-[#222] focus-within:shadow-xl focus-within:shadow-purple-500/10
        border border-transparent hover:border-gray-700 focus-within:border-gray-700
        cursor-pointer group relative overflow-hidden"
      onClick={() => playlistId && onPlaylistClick(playlistId)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playlistId && onPlaylistClick(playlistId);
        }
      }}
    >
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <AnimatedGradientBackground gradientIndex={gradientIndex} />
      </div>

      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div className="relative">
          <Image
            src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg"
            alt="Creator"
            width={40}
            height={40}
            className="rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 rounded-full bg-purple-500/0 group-hover:bg-purple-500/20 transition-colors duration-300"></div>
        </div>
        <div className="flex-1">
          <div className="font-semibold transition-colors duration-300 group-hover:text-white">
            {activity.user}
          </div>
          <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
            {activity.timestamp}
          </div>
        </div>
      </div>

      <WaveformThumbnail
        gradientIndex={gradientIndex}
        isPlaying={isPlaying}
        songCount={activity.songs?.length || 0}
        onThumbnailClick={() => playlistId && onPlaylistClick(playlistId)}
        onTogglePlay={handlePlayButtonClick}
      />

      <div className="mb-4 relative z-10">
        <div className="text-lg font-semibold mb-1 transition-colors duration-300 group-hover:text-white">
          {activity.playlistName}
        </div>
        <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          {activity.details}
        </div>
      </div>

      {activity.songs && (
        <SongList
          songs={activity.songs}
          playlist={activity.playlist}
          onPlaySong={onPlaySong}
        />
      )}
    </div>
  );
};