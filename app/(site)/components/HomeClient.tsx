"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CreatePlaylistModal } from "@/components/playlist";
import useOnPlay from "@/hooks/useOnPlay";
import { HeroCarousel } from "./HeroCarousel/HeroCarousel";
import { ActivityFeed } from "./ActivityFeed/ActivityFeed";
import { Sidebar } from "./Sidebar/Sidebar";
import { HomeClientProps, ActivityItem, ErrorState } from "./shared/types";
import { usePlaylistPlayback } from "@/hooks/usePlaylistPlayback";

const HomeClient: React.FC<HomeClientProps> = ({ 
  session, 
  initialPlaylists, 
  initialSongs 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [playlistInput, setPlaylistInput] = useState("");
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [songs, setSongs] = useState(initialSongs);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const onPlay = useOnPlay(songs);
  const [error, setError] = useState<ErrorState | null>(null);

  // Use the new playlist playback hook
  const { playingStates, playPlaylist, isPlaylistPlaying } = usePlaylistPlayback({ 
    songs 
  });

  const handleCreatePlaylist = () => {
    setIsCreateModalOpen(true);
  };

  const handlePlaylistPlay = (playlistId: string, firstSongId: string) => {
    playPlaylist(playlistId, firstSongId);
  };

  const slides = useMemo(() => [
    {
      id: 1,
      title: "Discover Your Sound",
      description: "Create, share, and explore music with a global community of artists and listeners.",
      buttonText: "Create Playlist",
      buttonStyle: {},
      background: "carousel-slide-1",
      onClickHandler: handleCreatePlaylist 
    },
    {
      id: 2,
      title: "Collaborate & Create",
      description: "Join forces with other music lovers to create extraordinary playlists that transport listeners to different timelines.",
      buttonText: "Start Collaborating",
      buttonStyle: { background: "#000", color: "#fff" },
      background: "carousel-slide-2",
    },
    {
      id: 3,
      title: "Find Your Trybe",
      description: "Join Trybes that match your unique vibe and connect with music lovers who share your taste.",
      buttonText: "Explore Trybes",
      buttonStyle: {},
      background: "carousel-slide-3",
    },
  ], []);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlaylists(initialPlaylists);
      setSongs(initialSongs);
      
      const playlistActivities: ActivityItem[] = initialPlaylists
        .slice(0, 5)
        .map((playlist, index) => {
          let username = "Anonymous";
          if (playlist.user) {
            username = playlist.user.username || 
                      (playlist.user.email ? playlist.user.email.split('@')[0] : "Anonymous");
          } else {
            const playlistWithUser = playlist as any;
            if (playlistWithUser.user) {
              username = playlistWithUser.user.username || 
                        (playlistWithUser.user.email ? playlistWithUser.user.email.split('@')[0] : "Anonymous");
            }
          }

          const playlistSongs = (playlist.playlist_songs || [])
            .sort((a, b) => a.position - b.position)
            .map((ps: any) => `${ps.songs.title} - ${ps.songs.author}`);
          
          let timestamp = "Just now";
          if (playlist.created_at) {
            const createdTime = new Date(playlist.created_at).getTime();
            const now = Date.now();
            const diffInMs = now - createdTime;
            const diffInSeconds = Math.floor(diffInMs / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);
            
            if (diffInSeconds < 60) {
              timestamp = "Just now";
            } else if (diffInMinutes < 60) {
              timestamp = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            } else if (diffInHours < 24) {
              timestamp = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else if (diffInDays < 7) {
              timestamp = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
            } else {
              const diffInWeeks = Math.floor(diffInDays / 7);
              if (diffInWeeks < 4) {
                timestamp = `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
              } else {
                timestamp = new Date(playlist.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            }
          } else {
            timestamp = index === 0 ? "Just now" : `${index + 1} hours ago`;
          }

          return {
            type: "playlist" as const, 
            user: username,
            action: "created", 
            playlistName: playlist.name,
            details: playlistSongs.length > 0 ? "" : "Be the first to add songs!",
            timestamp: timestamp,
            playlist: playlist,
            songs: playlistSongs
          };
        });

      setRecentActivities([...playlistActivities]);
      setIsLoading(false);
    };

    initializeData();
  }, [initialPlaylists, initialSongs, session]);

  const handlePlaylistCreated = (playlistId: string) => {
    setIsCreateModalOpen(false);
    setPlaylistInput("");
    router.refresh();
  };

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlists/${playlistId}`);
  };

  return (    
    <main className="max-w-[1200px] mx-auto px-[20px]">
      <HeroCarousel slides={slides} isLoading={isLoading} />
      
      <section className="flex gap-[30px] mb-[60px]">
        <ActivityFeed
          activities={recentActivities}
          isLoading={isLoading}
          error={error}
          onPlaylistClick={handlePlaylistClick}
          onPlaySong={onPlay}
          onPlaylistPlay={handlePlaylistPlay} // New prop
          playingStates={playingStates}
          isPlaylistPlaying={isPlaylistPlaying}
        />
        
        <Sidebar isLoading={isLoading} />
      </section>

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onChange={setIsCreateModalOpen}
        onPlaylistCreated={handlePlaylistCreated}
        defaultName={playlistInput}
      />
    </main>
  );
};

export default HomeClient;