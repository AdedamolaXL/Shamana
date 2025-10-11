"use client";
import { ActivityFeedProps } from "./types";
import { ActivityCard } from "./ActivityCard";

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading,
  error,
  onPlaylistClick,
  onPlaySong,
  onPlaylistPlay, // New prop
  playingStates,
  isPlaylistPlaying, // New prop
}) => {
  if (isLoading) {
    return (
      <div className="flex-[3] bg-[#111] rounded-xl p-5">
        <div className="text-center py-8 text-neutral-400">
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[3] bg-[#111] rounded-xl p-5">
      {error && (
        <div className="text-red-500 p-2.5 mb-5 rounded-lg bg-red-500/10 border border-red-500/20">
          {error.message}
        </div>
      )}

      {activities.map((activity, index) => (
        <ActivityCard
          key={activity.playlistId || index}
          activity={activity}
          index={index}
          onPlaylistClick={onPlaylistClick}
          onPlaySong={onPlaySong}
          onPlaylistPlay={onPlaylistPlay} // Pass new prop
          isPlaylistPlaying={isPlaylistPlaying} // Pass new prop
        />
      ))}
    </div>
  );
};