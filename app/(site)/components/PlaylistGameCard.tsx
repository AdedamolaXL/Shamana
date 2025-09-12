"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import { CreatePlaylistModal } from "@/components/playlist";

interface PlaylistGameCardProps {
  prompt: string;
  isActive: boolean;
  playlistId?: string;
}

const PlaylistGameCard: React.FC<PlaylistGameCardProps> = ({ 
  prompt, 
  isActive, 
  playlistId 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useUser();
  const authModal = useAuthModal();
  const router = useRouter();

  const handleClick = () => {
    if (isActive && playlistId) {
      // Redirect to existing playlist
      router.push(`/playlists/${playlistId}`);
      return;
    }
    
    if (!user) {
      authModal.onOpen();
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handlePlaylistCreated = (playlistId: string) => {
    setIsCreateModalOpen(false);
    // Redirect to the new playlist page
    router.push(`/playlists/${playlistId}`);
  };

  return (
    <>
      <div
        className={`aspect-square rounded-lg p-4 flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 ${
          isActive 
            ? 'bg-gradient-to-br from-green-600 to-emerald-500 border-2 border-emerald-400' 
            : 'bg-gradient-to-br from-emerald-600 to-teal-500'
        }`}
        onClick={handleClick}
      >
        <div className="text-center">
          <div className="text-white text-lg font-semibold mb-2">
            {prompt}
          </div>
          <div className="text-white/80 text-sm mb-1">
            {isActive ? 'Active - Add your song!' : 'Add songs to build this playlist'}
          </div>
          <div className={`text-xs ${
            isActive ? 'text-white/90' : 'text-white/60'
          }`}>
            {isActive ? 'Community Building' : 'Be the first to contribute'}
          </div>
          
          {isActive && (
            <div className="mt-2">
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div 
                  className="bg-white h-1.5 rounded-full" 
                  style={{ width: `${Math.random() * 30 + 50}%` }}
                ></div>
              </div>
              <div className="text-white/70 text-xs mt-1">
                {Math.floor(Math.random() * 50 + 10)} songs
              </div>
            </div>
          )}
        </div>
      </div>

      {!isActive && (
        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onChange={setIsCreateModalOpen}
          onPlaylistCreated={handlePlaylistCreated}
          defaultName={prompt}
        />
      )}
    </>
  );
};

export default PlaylistGameCard;