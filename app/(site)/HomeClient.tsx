"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { Playlist, Song } from "@/types";
import Header from "@/components/layout/Header";
import { FaMusic, FaPlay, FaClock } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CreatePlaylistModal } from "@/components/playlist";
import { MediaItem } from "@/components";
import { useRouter } from "next/navigation";
import useOnPlay from "@/hooks/useOnPlay";

interface ActivityItem {
  type: "dream" | "spotlight" | "update";
  user: string;
  action: string;
  playlistName: string;
  details: string;
  playlistId?: string;
  timestamp: string;
  playlist?: Playlist;
}

interface HomeClientProps {
  session: Session | null;
  initialPlaylists: Playlist[];
  initialSongs: Song[];
}

const HomeClient: React.FC<HomeClientProps> = ({ 
  session, 
  initialPlaylists, 
  initialSongs 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dreamInput, setDreamInput] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const router = useRouter();
  const onPlay = useOnPlay(songs);

  // Transform playlists into activity items when they load
  useEffect(() => {
    setPlaylists(initialPlaylists);
    setSongs(initialSongs);
    
    // Create activity items from playlists (most recent first)
    const playlistActivities: ActivityItem[] = initialPlaylists
      .slice(0, 5) // Show only the 5 most recent
      .map((playlist, index) => ({
        type: "dream" as const,
        user: session?.user?.email?.split('@')[0] || "Anonymous",
        action: "dreamed",
        playlistName: playlist.name,
        details: "Be the first to add songs!",
        playlistId: playlist.id,
        timestamp: index === 0 ? "Just now" : `${index + 1} hours ago`,
        playlist: playlist
      }));

    // Combine with some sample activities
    const sampleActivities: ActivityItem[] = [
      {
        type: "spotlight",
        user: "Sarah",
        action: "spotlighted",
        playlistName: "Workout Energy",
        details: "Critic: Needs more warm-up flow",
        timestamp: "5 hours ago"
      },
      {
        type: "update",
        user: "Tribe",
        action: "updated",
        playlistName: "Afrobeat Summer",
        details: "5 new nurtures",
        timestamp: "1 day ago"
      }
    ];

    setRecentActivities([...playlistActivities, ...sampleActivities]);
  }, [initialPlaylists, initialSongs, session]);

  const handleCreateDream = () => {
    if (dreamInput.trim()) {
      setIsCreateModalOpen(true);
    }
  };

  const handlePlaylistCreated = (playlistId: string) => {
    setIsCreateModalOpen(false);
    setDreamInput("");
    
    // Refresh the page to show the new playlist in the feed
    router.refresh();
  };

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlists/${playlistId}`);
  };

  const formatDuration = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900 min-h-screen">
      
      <main className="p-6">
        {/* Dream a Playlist Section */}
        <div className="bg-neutral-800 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <span>DREAM A PLAYLIST</span>
            <span className="text-green-500">💭</span>
          </h2>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter your playlist concept..."
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDream()}
              className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-md border border-neutral-600 focus:border-green-500 focus:outline-none"
            />
            <Button 
              onClick={handleCreateDream}
              className="bg-green-600 hover:bg-green-700 px-6"
              disabled={!dreamInput.trim()}
            >
              Create
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Feed Column - 3/4 width */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Feed</h2>
              
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="border-b border-neutral-700 pb-6 last:border-0 last:pb-0">
                    {/* Activity Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-full mt-1 ${
                        activity.type === "dream" ? "bg-green-600" : 
                        activity.type === "spotlight" ? "bg-blue-600" : "bg-purple-600"
                      }`}>
                        <FaMusic className="text-white text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          <span className="text-neutral-400">{activity.action}:</span>{" "}
                          <span className="text-green-400">{`"${activity.playlistName}"`}</span>
                        </p>
                        <p className="text-neutral-400 text-sm mt-1">
                          → {activity.details}
                        </p>
                        <p className="text-neutral-500 text-xs mt-2">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>

                    {/* Playlist Card (only for dream activities with playlist) */}
                    {activity.type === "dream" && activity.playlist && (
                      <div 
                        className="bg-neutral-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-600 transition-colors"
                        onClick={() => handlePlaylistClick(activity.playlistId!)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-neutral-600 rounded-lg flex items-center justify-center">
                            <FaMusic className="text-neutral-400 text-2xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{activity.playlist.name}</h3>
                            {activity.playlist.description && (
                              <p className="text-neutral-400 text-sm mt-1">
                                {activity.playlist.description}
                              </p>
                            )}
                            <p className="text-green-400 text-xs mt-2">
                              Click to contribute songs
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                      {activity.type === "dream" && activity.playlistId ? (
                        <button
                          onClick={() => handlePlaylistClick(activity.playlistId!)}
                          className="text-green-400 hover:text-green-300 text-sm font-medium px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
                        >
                          View Playlist
                        </button>
                      ) : (
                        <span className="text-green-400 text-sm font-medium">
                          View {activity.type === "spotlight" ? "Spotlight" : "Update"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show empty state if no activities */}
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <FaMusic className="text-neutral-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">No activities yet</h3>
                  <p className="text-neutral-400">Be the first to dream a playlist!</p>
                </div>
              )}
            </div>
          </div>

          {/* Queue Column - 1/4 width */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                  <FaClock className="text-green-500" />
                  Song Queue
                </h2>
                <span className="text-neutral-400 text-sm">
                  {songs.length} songs
                </span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {songs.slice(0, 20).map((song, index) => (
                  <div 
                    key={song.id} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-700 transition-colors cursor-pointer group"
                    onClick={() => onPlay(song.id)}
                  >
                    <div className="w-8 h-8 bg-neutral-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-neutral-400 text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {song.title}
                      </p>
                      <p className="text-neutral-400 text-xs truncate">
                        {song.author}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-xs">
                        {formatDuration()}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <FaPlay className="text-green-500 text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state for queue */}
              {songs.length === 0 && (
                <div className="text-center py-8">
                  <FaMusic className="text-neutral-400 text-2xl mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm">No songs available</p>
                </div>
              )}

              {/* View all songs link */}
              {songs.length > 20 && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <Link 
                    href="/search" 
                    className="text-green-400 hover:text-green-300 text-sm font-medium text-center block"
                  >
                    View All Songs →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onChange={setIsCreateModalOpen}
          onPlaylistCreated={handlePlaylistCreated}
          defaultName={dreamInput}
        />
      </main>
    </div>
  );
};

export default HomeClient;