"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CreatePlaylistModal } from "@/components/playlist";
import useOnPlay from "@/hooks/useOnPlay";
import { HeroCarousel } from "./HeroCarousel/HeroCarousel";
import { ActivityFeed } from "./ActivityFeed/ActivityFeed";
import { Sidebar } from "./Sidebar/Sidebar";
import { HomeClientProps, ErrorState } from "./shared/types";
import { usePlaylistPlayback } from "@/hooks/usePlaylistPlayback";
import { useActivityFeed } from "@/hooks/useActivityFeed"; 

const HomeClient: React.FC<HomeClientProps> = ({ 
  session, 
  initialSongs 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [playlistInput, setPlaylistInput] = useState("");
  const [songs, setSongs] = useState(initialSongs);
  const [error, setError] = useState<ErrorState | null>(null);

  // Use the new real-time activity feed hook
  const { activities: recentActivities, isLoading } = useActivityFeed();
  
  const router = useRouter();
  const onPlay = useOnPlay(songs);

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
          onPlaylistPlay={handlePlaylistPlay}
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