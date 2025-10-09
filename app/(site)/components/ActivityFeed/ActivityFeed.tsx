"use client";
import { ActivityFeedProps } from "./types";
import { ActivityCard } from "./ActivityCard";
import { ActivitySkeleton } from "./ActivitySkeleton";

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading,
  error,
  onPlaylistClick,
  onPlaySong,
  playingStates,
  onTogglePlayState,
}) => {
  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((item) => (
          <ActivitySkeleton key={item} />
        ))}
      </>
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
          isPlaying={playingStates[activity.playlist?.id || index]}
          onTogglePlayState={onTogglePlayState}
        />
      ))}
    </div>
  );
};