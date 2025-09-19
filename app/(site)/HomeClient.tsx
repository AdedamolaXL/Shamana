"use client";
import { useState, useEffect } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { Playlist, Song } from "@/types";
import Header from "@/components/layout/Header";
import { FaMusic, FaPlay, FaClock, FaUsers, FaFire, FaSeedling, FaStar, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CreatePlaylistModal } from "@/components/playlist";
import { MediaItem } from "@/components";
import { useRouter } from "next/navigation";
import useOnPlay from "@/hooks/useOnPlay";
import CreateTribeModal from "@/components/tribe/CreateTribeModal";

interface ActivityItem {
  type: "dream" | "spotlight" | "update";
  user: string;
  action: string;
  playlistName: string;
  details: string;
  playlistId?: string;
  timestamp: string;
  playlist?: Playlist & { users?: { username: string, email: string } };
}

interface MusicTribe {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  playlistCount: number;
  icon: React.ReactNode;
  color: string;
  isFeatured?: boolean;
  category?: string;
  created_at?: string;
}

interface HomeClientProps {
  session: Session | null;
  initialPlaylists: (Playlist & { users?: { username: string, email: string } })[];
  initialSongs: Song[];
}

  // Music Tribes data
 const sampleTribes: MusicTribe[] = [
    {
      id: "afrobeat",
      name: "Afrobeat Collective",
      description: "Vibrant rhythms and infectious grooves from Africa",
      memberCount: 1240,
      playlistCount: 56,
      icon: <FaFire className="text-orange-500" />,
      color: "from-orange-500 to-red-500",
      isFeatured: true
    },
    {
      id: "indie",
      name: "Indie Discovery",
      description: "Fresh independent artists and hidden gems",
      memberCount: 890,
      playlistCount: 42,
      icon: <FaSeedling className="text-green-500" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "electronic",
      name: "Electronic Waves",
      description: "EDM, synthwave, and electronic vibrations",
      memberCount: 1560,
      playlistCount: 78,
      icon: <FaStar className="text-purple-500" />,
      color: "from-purple-500 to-pink-500"
    }
 ];

const HomeClient: React.FC<HomeClientProps> = ({ 
  session, 
  initialPlaylists, 
  initialSongs 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTribeModalOpen, setIsCreateTribeModalOpen] = useState(false);
  const [dreamInput, setDreamInput] = useState("");
  const [playlists, setPlaylists] = useState<(Playlist & { users?: { username: string, email: string } })[]>(initialPlaylists);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [musicTribes, setMusicTribes] = useState<MusicTribe[]>([]);
  const [isLoadingTribes, setIsLoadingTribes] = useState(true);
  const router = useRouter();
  const onPlay = useOnPlay(songs);


  
    // Fetch tribes from API
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setIsLoadingTribes(true);
        const response = await fetch('/api/tribes');
        
        if (response.ok) {
          const realTribes = await response.json();
          
          // Format real tribes to match MusicTribe interface
          const formattedTribes: MusicTribe[] = realTribes.map((tribe: any) => ({
            id: tribe.id,
            name: tribe.name,
            description: tribe.description,
            memberCount: tribe.memberCount,
            playlistCount: 0, // You can fetch this separately if needed
            icon: <FaMusic className={`text-${getColorFromCategory(tribe.category)}-500`} />,
            color: getGradientFromCategory(tribe.category),
            category: tribe.category,
            created_at: tribe.created_at
          }));

          // Combine real tribes with sample tribes (or show only real tribes if they exist)
          if (formattedTribes.length > 0) {
            setMusicTribes(formattedTribes);
          } else {
            setMusicTribes(sampleTribes);
          }
        } else {
          // Fallback to sample tribes if API fails
          setMusicTribes(sampleTribes);
        }
      } catch (error) {
        console.error('Error fetching tribes:', error);
        setMusicTribes(sampleTribes);
      } finally {
        setIsLoadingTribes(false);
      }
    };

    fetchTribes();
  }, []);

  // Helper functions for tribe styling
  const getColorFromCategory = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'rock': 'red',
      'pop': 'pink',
      'jazz': 'yellow',
      'hiphop': 'purple',
      'electronic': 'blue',
      'classical': 'indigo',
      'country': 'orange',
      'rnb': 'red',
      'reggae': 'green',
      'metal': 'gray',
      'folk': 'brown',
      'blues': 'blue',
      'afrobeat': 'orange',
      'indie': 'green'
    };
    return colorMap[category.toLowerCase()] || 'gray';
  };

  const getGradientFromCategory = (category: string): string => {
    const gradientMap: { [key: string]: string } = {
      'rock': 'from-red-500 to-orange-500',
      'pop': 'from-pink-500 to-rose-500',
      'jazz': 'from-yellow-500 to-amber-500',
      'hiphop': 'from-purple-500 to-pink-500',
      'electronic': 'from-blue-500 to-cyan-500',
      'classical': 'from-indigo-500 to-purple-500',
      'country': 'from-orange-500 to-yellow-500',
      'rnb': 'from-red-500 to-pink-500',
      'reggae': 'from-green-500 to-lime-500',
      'metal': 'from-gray-500 to-slate-500',
      'folk': 'from-amber-500 to-orange-500',
      'blues': 'from-blue-500 to-indigo-500',
      'afrobeat': 'from-orange-500 to-red-500',
      'indie': 'from-green-500 to-emerald-500'
    };
    return gradientMap[category.toLowerCase()] || 'from-gray-500 to-slate-500';
  };

  // Refresh tribes after creating a new one
  const handleTribeCreated = () => {
    // Refresh the tribes list
    const fetchTribes = async () => {
      try {
        const response = await fetch('/api/tribes');
        if (response.ok) {
          const realTribes = await response.json();
          const formattedTribes: MusicTribe[] = realTribes.map((tribe: any) => ({
            id: tribe.id,
            name: tribe.name,
            description: tribe.description,
            memberCount: tribe.memberCount,
            playlistCount: 0,
            icon: <FaMusic className={`text-${getColorFromCategory(tribe.category)}-500`} />,
            color: getGradientFromCategory(tribe.category),
            category: tribe.category,
            created_at: tribe.created_at
          }));
          setMusicTribes(formattedTribes);
        }
      } catch (error) {
        console.error('Error refreshing tribes:', error);
      }
    };

    fetchTribes();
  };
  
  useEffect(() => {
  setPlaylists(initialPlaylists);
  setSongs(initialSongs);
  
  // Create activity items from playlists (most recent first)
const playlistActivities: ActivityItem[] = initialPlaylists
    .slice(0, 5)
    .map((playlist, index) => {
      // Get the username from the playlist user data - FIXED HERE
      let username = "Anonymous";
      if (playlist.users) {
        username = playlist.users.username || 
                  (playlist.users.email ? playlist.users.email.split('@')[0] : "Anonymous");
      } else {
        // Fallback: try to get user data from the joined users table
        // This handles the case where the user data is in a different property
        const playlistWithUser = playlist as any;
        if (playlistWithUser.user) {
          username = playlistWithUser.user.username || 
                    (playlistWithUser.user.email ? playlistWithUser.user.email.split('@')[0] : "Anonymous");
        }
      }
      
      
      // Calculate relative timestamp
      let timestamp = "Just now";
      if (playlist.created_at) {
        const createdTime = new Date(playlist.created_at).getTime();
        const now = Date.now();
        const diffInHours = Math.floor((now - createdTime) / (1000 * 60 * 60));
        
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor((now - createdTime) / (1000 * 60));
          timestamp = diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
          timestamp = `${diffInHours} hours ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          timestamp = `${diffInDays} days ago`;
        }
      } else {
        timestamp = index === 0 ? "Just now" : `${index + 1} hours ago`;
      }

      return {
        type: "dream" as const,
        user: username,
        action: "dreamed",
        playlistName: playlist.name,
        details: "Be the first to add songs!",
        playlistId: playlist.id,
        timestamp: timestamp,
        playlist: playlist
      };
    });

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


    const handleJoinTribe = (tribeId: string) => {
    if (!session) {
      // Open auth modal if not logged in
      // You might want to implement an auth modal hook here
      return;
    }
    
    // Logic to join a tribe
    console.log(`Joining tribe: ${tribeId}`);
    // You can implement API calls to track tribe membership here
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
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
        {/* Show who created the playlist */}
        {activity.playlist.users && (
          <p className="text-neutral-400 text-xs mt-1">
            Created by: {activity.playlist.users.username || activity.playlist.users.email?.split('@')[0]}
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

             {/* Right Column - Music Tribes (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                  <FaUsers className="text-green-500" />
                  Music Tribes
                </h2>
                <span className="text-neutral-400 text-sm">
                  {musicTribes.length} communities
                </span>
              </div>

              {isLoadingTribes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-neutral-700 rounded-lg animate-pulse">
                      <div className="h-4 bg-neutral-600 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-600 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {musicTribes.map((tribe) => (
                      <div 
                        key={tribe.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                          tribe.isFeatured 
                            ? `bg-gradient-to-r ${tribe.color} border-2 border-white/20` 
                            : 'bg-neutral-700 hover:bg-neutral-600'
                        }`}
                        onClick={() => router.push(`/tribes/${tribe.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/10 rounded-full">
                            {tribe.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm mb-1">
                              {tribe.name}
                            </h3>
                            <p className="text-neutral-300 text-xs mb-2">
                              {tribe.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span>{formatNumber(tribe.memberCount)} members</span>
                              <span>{formatNumber(tribe.playlistCount)} playlists</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinTribe(tribe.id);
                            }}
                            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
                          >
                            <FaPlus size={10} />
                            Join Tribe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create your own tribe CTA */}
                  <div className="mt-6 pt-6 border-t border-neutral-700">
                    <div className="text-center">
                     <p className="text-neutral-400">Don&apos;t see your tribe?</p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-sm w-full"
                        onClick={() => setIsCreateTribeModalOpen(true)}
                      >
                        Start Your Own Tribe
                      </Button>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-6 pt-6 border-t border-neutral-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {formatNumber(musicTribes.reduce((sum, tribe) => sum + tribe.memberCount, 0))}
                        </p>
                        <p className="text-neutral-400 text-xs">Total Members</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {formatNumber(musicTribes.reduce((sum, tribe) => sum + tribe.playlistCount, 0))}
                        </p>
                        <p className="text-neutral-400 text-xs">Total Playlists</p>
                      </div>
                    </div>
                  </div>
                </>
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

<CreateTribeModal
          isOpen={isCreateTribeModalOpen}
          onChange={setIsCreateTribeModalOpen}
          onTribeCreated={handleTribeCreated}
        />

      </main>
    </div>
  );
};

export default HomeClient;