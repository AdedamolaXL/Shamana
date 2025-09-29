"use client";
import { useState, useEffect } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { FaUsers, FaPlus, FaMusic } from "react-icons/fa";
import { Button } from "@/components/ui";
import CreateTribeModal from "@/components/tribe/CreateTribeModal";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

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

interface TribesClientProps {
  session: Session | null;
}

// Move sampleTribes OUTSIDE the component
const sampleTribes: MusicTribe[] = [
  {
    id: "afrobeat",
    name: "Afrobeat Collective",
    description: "Vibrant rhythms and infectious grooves from Africa",
    memberCount: 1240,
    playlistCount: 56,
    icon: <FaMusic className="text-orange-500" />,
    color: "from-orange-500 to-red-500",
    isFeatured: true
  },
  {
    id: "indie",
    name: "Indie Discovery",
    description: "Fresh independent artists and hidden gems",
    memberCount: 890,
    playlistCount: 42,
    icon: <FaMusic className="text-green-500" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "electronic",
    name: "Electronic Waves",
    description: "EDM, synthwave, and electronic vibrations",
    memberCount: 1560,
    playlistCount: 78,
    icon: <FaMusic className="text-purple-500" />,
    color: "from-purple-500 to-pink-500"
  }
];

const TribesClient: React.FC<TribesClientProps> = ({ session }) => {
  const [musicTribes, setMusicTribes] = useState<MusicTribe[]>([]);
  const [isLoadingTribes, setIsLoadingTribes] = useState(true);
  const [isCreateTribeModalOpen, setIsCreateTribeModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const authModal = useAuthModal();

  // Helper functions for tribe styling
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
    return gradientMap[category?.toLowerCase()] || 'from-gray-500 to-slate-500';
  };

  // Fetch tribes from API - now sampleTribes can be safely used
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
            memberCount: tribe.memberCount || 0,
            playlistCount: 0,
            icon: <FaMusic className="text-gray-500" />,
            color: getGradientFromCategory(tribe.category),
            category: tribe.category,
            created_at: tribe.created_at
          }));

          setMusicTribes(formattedTribes);
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
  }, []); // Now the dependency array can be empty

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
            memberCount: tribe.memberCount || 0,
            playlistCount: 0,
            icon: <FaMusic className="text-gray-500" />,
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

  const handleCreateTribe = () => {
    if (!user) {
      authModal.onOpen();
      return;
    }
    setIsCreateTribeModalOpen(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="bg-neutral-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2 flex items-center gap-3">
              <FaUsers className="text-green-500" />
              Music Tribes
            </h1>
            <p className="text-neutral-400">
              Join communities around your favorite music genres and discover new sounds
            </p>
          </div>
          <Button 
            onClick={handleCreateTribe}
            className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0"
          >
            <FaPlus className="mr-2" />
            Start a Tribe
          </Button>
        </div>

        {/* Tribes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingTribes ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-neutral-700 rounded mb-4"></div>
                <div className="h-4 bg-neutral-700 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            musicTribes.map((tribe) => (
              <div 
                key={tribe.id}
                className={`bg-neutral-800 rounded-lg p-6 cursor-pointer transition-all transform hover:scale-105 ${
                  tribe.isFeatured ? `bg-gradient-to-r ${tribe.color} border-2 border-white/20` : ''
                }`}
                onClick={() => router.push(`/tribes/${tribe.id}`)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-white/10 rounded-full">
                    {tribe.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {tribe.name}
                    </h3>
                    <p className="text-neutral-300 text-sm mb-4">
                      {tribe.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>{formatNumber(tribe.memberCount)} members</span>
                      <span>{formatNumber(tribe.playlistCount)} playlists</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tribes/${tribe.id}`);
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-md transition-colors"
                  >
                    View Tribe
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty state */}
        {!isLoadingTribes && musicTribes.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-neutral-400 text-5xl mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No tribes yet</h3>
            <p className="text-neutral-400 mb-6">Be the first to create a music tribe!</p>
            <Button 
              onClick={handleCreateTribe}
              className="bg-green-600 hover:bg-green-700"
            >
              <FaPlus className="mr-2" />
              Create First Tribe
            </Button>
          </div>
        )}

        <CreateTribeModal
          isOpen={isCreateTribeModalOpen}
          onChange={setIsCreateTribeModalOpen}
          onTribeCreated={handleTribeCreated}
        />
      </div>
    </div>
  );
};

export default TribesClient;