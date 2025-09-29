"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { Playlist, Song, PlaylistWithSongs } from "@/types";
import { FaMusic, FaPlay, FaClock, FaUsers, FaFire, FaSeedling, FaStar, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CreatePlaylistModal } from "@/components/playlist";
import { MediaItem } from "@/components";
import { useRouter } from "next/navigation";
import useOnPlay from "@/hooks/useOnPlay";
import CreateTribeModal from "@/components/tribe/CreateTribeModal";
import Image from "next/image";

interface ActivityItem {
  type: "dream" | "spotlight" | "update";
  user: string;
  action: string;
  playlistName: string;
  details: string;
  playlistId?: string;
  timestamp: string;
  playlist?: PlaylistWithSongs;
  songs?: string[];
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
  initialPlaylists: PlaylistWithSongs[];
  initialSongs: Song[];
}


  const gradientPalette = [
  "linear-gradient(135deg, #6a11cb, #2575fc)",  // Purple to Blue
  "linear-gradient(135deg, #ff9a9e, #fad0c4)",  // Pink to Peach
  "linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6)",  // Teal to Green
  "linear-gradient(135deg, #8360c3, #2ebf91)",  // Purple to Green
  "linear-gradient(135deg, #ff5e62, #ff9966)",  // Red to Orange
  "linear-gradient(135deg, #42e695, #3bb2b8)",  // Green to Teal
  "linear-gradient(135deg, #ff7e5f, #feb47b)",  // Coral to Peach
  "linear-gradient(135deg, #667eea, #764ba2)",  // Blue to Purple
  "linear-gradient(135deg, #f093fb, #f5576c)",  // Pink to Red
  "linear-gradient(135deg, #4facfe, #00f2fe)"   // Blue to Cyan
];  


 


  const trybes = [
    "Afrobbeats",
    "Amapiano",
    "Hiplife",
    "Alte",
  ];

    const events = [
    { day: "15", month: "Sep", title: "Indie Rock Jam Session", details: "8:00 PM • Virtual" },
    { day: "18", month: "Sep", title: "Electronic Music Workshop", details: "7:30 PM • Studio A" },
    { day: "22", month: "Sep", title: "Hip-Hop Beat Making", details: "6:00 PM • The Loft" },
    { day: "25", month: "Sep", title: "R&B Vocal Session", details: "5:00 PM • Vocal Booth" },
  ];

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
      id: "alte",
      name: "Alte Season",
      description: "Fresh independent artists and hidden gems",
      memberCount: 890,
      playlistCount: 42,
      icon: <FaSeedling className="text-green-500" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "Ooontz Ooontz",
      name: "Afro House",
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
  const [playlists, setPlaylists] = useState<PlaylistWithSongs[]>(initialPlaylists);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [musicTribes, setMusicTribes] = useState<MusicTribe[]>([]);
  const [isLoadingTribes, setIsLoadingTribes] = useState(true);
  const router = useRouter();
  const onPlay = useOnPlay(songs);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState(null);




  
// Define handleCreateDream first since it's used in slides
  const handleCreateDream = () => {
    console.log("Create playlist button clicked");
    if (dreamInput.trim()) {
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // Define slides BEFORE the useEffect that depends on it
  const slides = [
    {
      id: 1,
      title: "Discover Your Sound",
      description:
        "Create, share, and explore music with a global community of artists and listeners.",
      buttonText: "Create Playlist",
      buttonStyle: {},
      background: "carousel-slide-1",
      onClickHandler: handleCreateDream 
    },
    {
      id: 2,
      title: "Collaborate & Create",
      description:
        "Join forces with other music lovers to create extraordinary playlists that transport listeners to different timelines. Get rewarded with exclusive NFTs for creating content that resonates with people who love it just as much.",
      buttonText: "Start Collaborating",
      buttonStyle: { background: "#000", color: "#fff" },
      background: "carousel-slide-2",
    },
    {
      id: 3,
      title: "Find Your Trybe",
      description:
        "Join Trybes that match your unique vibe and connect with music lovers who share your taste. Discover new music, share your creations, and build lasting connections with people who get your sound.",
      buttonText: "Explore Trybes",
      buttonStyle: {},
      background: "carousel-slide-3",
    },
  ];

  // Helper function for autoplay
 const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  // Now the useEffect can safely use slides.length
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [startAutoPlay]);

  const showSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoPlay();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoPlay();
  };

  
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
      // Get the username from the playlist user data
      let username = "Anonymous";
      if (playlist.user) {
        username = playlist.user.username || 
                  (playlist.user.email ? playlist.user.email.split('@')[0] : "Anonymous");
      } else {
        // Fallback: try to get user data from the joined users table
        const playlistWithUser = playlist as any;
        if (playlistWithUser.user) {
          username = playlistWithUser.user.username || 
                    (playlistWithUser.user.email ? playlistWithUser.user.email.split('@')[0] : "Anonymous");
        }
      }

      // Extract songs from playlist
      const playlistSongs = (playlist.playlist_songs || [])
        .sort((a, b) => a.position - b.position)
        .map((ps: any) => `${ps.songs.title} - ${ps.songs.author}`);
      
      // Calculate relative timestamp - FIXED THIS PART
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
            // For older dates, show the actual date
            timestamp = new Date(playlist.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          }
        }
      } else {
        // Fallback for playlists without created_at
        timestamp = index === 0 ? "Just now" : `${index + 1} hours ago`;
      }

      return {
        type: "dream" as const,
        user: username,
        action: "dreamed",
        playlistName: playlist.name,
        details: playlistSongs.length > 0 ? "" : "Be the first to add songs!",
        timestamp: timestamp, // Use the calculated relative time
        playlist: playlist,
        songs: playlistSongs
      };
    });

    // Combine with some sample activities
    // const sampleActivities: ActivityItem[] = [
    //   {
    //     type: "spotlight",
    //     user: "Sarah",
    //     action: "spotlighted",
    //     playlistName: "Workout Energy",
    //     details: "Critic: Needs more warm-up flow",
    //     timestamp: "5 hours ago"
    //   },
    //   {
    //     type: "update",
    //     user: "Tribe",
    //     action: "updated",
    //     playlistName: "Afrobeat Summer",
    //     details: "5 new nurtures",
    //     timestamp: "1 day ago"
    //   }
    // ];

    setRecentActivities([...playlistActivities]);
  }, [initialPlaylists, initialSongs, session]);

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
    <main className="max-w-[1200px] mx-auto px-[20px]">
      
       {/* Hero Carousel */}
        <section className="relative my-10 rounded-xl overflow-hidden h-[400px]">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-800 ease-in-out
          flex items-center px-16
          ${slide.background} ${index === currentSlide ? "opacity-100 z-10" : ""}`}
              >
                <div className="max-w-[600px] mx-auto text-center">
                  <h1 className="text-4xl mb-4">{slide.title}</h1>
                  <p className="text-lg mb-6 opacity-90">{slide.description}</p>
                  <button className="bg-white text-[#6a11cb] px-8 py-3 rounded-full text-base font-semibold cursor-pointer transform transition-transform duration-200 hover:scale-105"
                    style={slide.buttonStyle}
                    onClick={slide.onClickHandler}
                  >
                    {slide.buttonText}

                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-5 z-10">
            <button className="bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full text-white text-xl flex items-center justify-center cursor-pointer transition-colors" onClick={prevSlide}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full text-white text-xl flex items-center justify-center cursor-pointer transition-colors"
      onClick={nextSlide}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="absolute bottom-5 left-0 w-full flex justify-center z-10">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 cursor-pointer transition-colors ${
          index === currentSlide ? "bg-white" : "bg-white/50"
        }`}
                onClick={() => showSlide(index)}
              ></div>
            ))}
          </div>
        </section>
      
      <section className="flex gap-[30px] mb-[60px]">
  {/* Feed */}
  <div className="flex-[3] bg-[#111] rounded-xl p-5">
    {error && (
      <div className="text-red-500 p-2.5 mb-5">{error}</div>
    )}

    {recentActivities.map((activity, index) => {
  // Get a gradient based on the index to cycle through the palette
  const gradientIndex = index % gradientPalette.length;
  const thumbnailGradient = gradientPalette[gradientIndex];
  
  // Different pulse speeds for variety
  const pulseSpeed = index % 3 === 0 ? 'pulse-slow' : index % 3 === 1 ? 'pulse-animation' : 'pulse-fast';
  const pulseDelay = `pulse-delay-${index % 3}`;
  
  return (
    <div key={activity.playlistId || index} className="bg-[#1a1a1a] rounded-xl p-5 mb-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
         <Image
          src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg"
          alt="Creator"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-semibold">{activity.user}</div>
          <div className="text-sm text-gray-400 mt-1">{activity.timestamp}</div>
        </div>
      </div>

      {/* Playlist Thumbnail with Pulsing Animation */}
      <div
        className={`relative h-[180px] rounded-lg mb-4 overflow-hidden ${pulseSpeed} ${pulseDelay}`}
        style={{ 
          background: activity.type === "dream" 
            ? thumbnailGradient 
            : activity.type === "spotlight" 
              ? "linear-gradient(135deg, #ff9a9e, #fad0c4)"
              : "linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6)"
        }}
      >
        {/* Optional: Add a subtle inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:bg-white hover:scale-110 z-10"
          onClick={() => activity.playlist && handlePlaylistClick(activity.playlist.id)}
        >
          <i className="fas fa-play text-black text-xl"></i>
        </div>
      </div>

      {/* Rest of the activity content remains the same */}
      <div className="mb-4">
        <div className="text-lg font-semibold mb-1">{activity.playlistName}</div>
        <div className="text-sm text-gray-300">{activity.details}</div>
      </div>

      {/* Song List */}
      <div className="flex flex-col gap-1.5 mb-4">
        {activity.songs?.map((song: string, index: number) => (
          <div key={index} className="flex items-center gap-2.5 text-sm text-gray-300">
            <span className="text-[#6a11cb] font-medium w-5">{index + 1}</span>
            <span>{song}</span>
          </div>
        ))}
      </div>
    </div>
  );
    })}
          
  </div>

  {/* Trybes & Events */}
  <div className="flex-1 flex flex-col gap-[30px]">
    {/* Trybes */}
    <div className="bg-[#111] rounded-xl p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Trybes for you</h2>
        <a href="#" className="text-[#6a11cb] font-medium">View all</a>
      </div>
      <div className="flex flex-col gap-4">
        {trybes.map((trybe, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-3 border-b border-[#222] last:border-b-0"
          >
            <div className="font-medium">{trybe}</div>
            <button className="bg-transparent border border-[#6a11cb] text-[#6a11cb] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors hover:bg-[#6a11cb] hover:text-white">
              View
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Events */}
    <div className="bg-[#111] rounded-xl p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Upcoming Jam Sessions</h2>
        <a href="#" className="text-[#6a11cb] font-medium">View all</a>
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event, index) => (
          <div key={index} className="flex flex-col gap-3 p-4 border border-[#333] rounded-lg">
            <div className="flex gap-3">
              <div className="flex flex-col items-center justify-center bg-[#6a11cb] rounded-lg min-w-[50px] h-[50px] p-1.5">
                <div className="text-lg font-semibold leading-none">{event.day}</div>
                <div className="text-[0.7rem] uppercase">{event.month}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">{event.title}</div>
                <div className="text-xs text-gray-300">{event.details}</div>
              </div>
            </div>
            <button className="bg-transparent border border-[#6a11cb] text-[#6a11cb] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors hover:bg-[#6a11cb] hover:text-white w-full text-center">
              Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

       

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
    
  );
};

export default HomeClient;