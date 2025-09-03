import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaList } from "react-icons/fa";
import { Playlist } from "@/types";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";
import CreatePlaylistModal from "./CreatePlaylistModal";
import toast from "react-hot-toast";

interface AddToPlaylistButtonProps {
  songId: string;
}

const AddToPlaylistButton: React.FC<AddToPlaylistButtonProps> = ({ songId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const authModal = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && user) {
      const fetchPlaylists = async () => {
        try {
          const response = await fetch('/api/playlists');
          if (response.ok) {
            const userPlaylists = await response.json();
            setPlaylists(userPlaylists);
          }
        } catch (error) {
          console.error('Failed to fetch playlists:', error);
        }
      };
      fetchPlaylists();
    }
  }, [isOpen, user]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user) {
      authModal.onOpen();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/playlists/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId, songId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add song to playlist');
      }

      setIsOpen(false);
      toast.success("Song added to playlist!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add song to playlist");
    } finally {
      setIsLoading(false);
    }
  };

 // In AddToPlaylistButton.tsx
const handlePlaylistCreated = async (playlistId: string) => {
  // After creating a playlist, add the song to it
  setIsLoading(true);
  try {
    const response = await fetch('/api/playlists/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playlistId, songId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add song to playlist');
    }

    setIsOpen(false);
    setIsCreateModalOpen(false);
    toast.success("Playlist created and song added!");
    
    // Add a small delay before redirecting to ensure the playlist is available
    setTimeout(() => {
      router.push(`/playlists/${playlistId}`);
    }, 500);
  } catch (error) {
    console.error(error);
    toast.error("Failed to add song to playlist");
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <>
      <button
        onClick={() => {
          if (!user) {
            authModal.onOpen();
            return;
          }
          setIsOpen(true);
        }}
        className="hover:opacity-75 transition"
      >
        <FaList size={20} />
      </button>

      <Modal
        title="Add to Playlist"
        description="Select a playlist to add this song to"
        isOpen={isOpen}
        onChange={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-4 max-h-60 overflow-y-auto">
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              disabled={isLoading}
              className="p-2 bg-neutral-800 rounded-md hover:bg-neutral-700 transition text-left"
            >
              {playlist.name}
            </button>
          ))}
          
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            className="p-2 bg-green-600 rounded-md hover:bg-green-500 transition text-center font-semibold"
          >
            + Create New Playlist
          </button>
        </div>
      </Modal>

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onChange={setIsCreateModalOpen}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </>
  );
};

export default AddToPlaylistButton;