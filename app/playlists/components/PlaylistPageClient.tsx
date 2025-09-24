"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlaylistWithSongs, Song } from "@/types";
import PlaylistContent from "../components/PlaylistContent";
import { Button } from "@/components/ui";
import { FaPlus, FaMusic, FaCheck } from "react-icons/fa";
import { MediaItem } from "@/components";
import useOnPlay from "@/hooks/useOnPlay";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
  allSongs: Song[]; // Add allSongs prop
}

const PlaylistPageClient: React.FC<PlaylistPageClientProps> = ({ playlist, allSongs }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [addedSongs, setAddedSongs] = useState<string[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const onPlay = useOnPlay(allSongs);

  // Update local state if prop changes
  useEffect(() => {
    setCurrentPlaylist(playlist);
  }, [playlist]);

  const handleAddToPlaylist = async (songId: string) => {
    if (!user) {
      toast.error("Please sign in to add songs");
      return;
    }

    const isAlreadyInPlaylist = currentPlaylist.songs.some(s => s.id === songId);
    if (isAlreadyInPlaylist) {
      toast.error("This song is already in the playlist");
      return;
    }

    setIsAdding(songId);
    
    try {
      const response = await fetch('/api/playlists/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: currentPlaylist.id,
          songId: songId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to add song (${response.status})`);
      }

      // Update the local state to reflect the new song
      const addedSong = allSongs.find(song => song.id === songId);
      if (addedSong) {
        setCurrentPlaylist(prev => ({
          ...prev,
          songs: [...prev.songs, addedSong]
        }));
        
        // Track the newly added song
        setAddedSongs(prev => [...prev, songId]);
      }

      toast.success("Song added to playlist!");
    } catch (error: any) {
      console.error('Error adding song:', error);
      toast.error(error.message || "Failed to add song to playlist");
    } finally {
      setIsAdding(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("Please sign in to save changes");
      return;
    }

    try {
      // Reward tokens based on the number of songs added
      if (addedSongs.length > 0) {
        try {
          const rewardResponse = await fetch('/api/token/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: addedSongs.length,
              playlistId: currentPlaylist.id
            }),
          });

          if (rewardResponse.ok) {
            const rewardData = await rewardResponse.json();
            toast.success(`Earned ${addedSongs.length} tokens for your contributions!`);
            console.log('Tokens rewarded:', rewardData);
          } else {
            console.warn('Token reward failed');
            toast.success("Playlist updated successfully!");
          }
        } catch (tokenError) {
          console.warn('Token minting error:', tokenError);
          toast.success("Playlist updated successfully!");
        }
      } else {
        toast.success("Playlist updated successfully!");
      }

      // Reset added songs tracking
      setAddedSongs([]);
      setShowLibrary(false);
      
      // Refresh the page to get latest data
      router.refresh();
      
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error("Failed to save changes");
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <div className="mt-20 px-6">
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row items-center gap-x-5 mb-8">
          <div className="relative h-32 w-32 lg:h-44 lg:w-44 flex-shrink-0">
            <Image 
              fill
              src={currentPlaylist.image_path || "/images/playlist.png"}
              alt="Playlist"
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
            <p className="hidden md:block font-semibold text-sm text-neutral-400">Playlist</p>
            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
              {currentPlaylist.name}
            </h1>
            {currentPlaylist.description && (
              <p className="text-neutral-400 text-lg">
                {currentPlaylist.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-4 mt-2 text-neutral-400 text-sm">
              <span>{currentPlaylist.songs.length} songs</span>
              <span>•</span>
              <span>Community playlist</span>
              {addedSongs.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-green-400">{addedSongs.length} new songs added</span>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <Button 
                onClick={() => setShowLibrary(!showLibrary)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 flex items-center gap-2"
              >
                <FaPlus />
                {showLibrary ? 'Hide Song Library' : 'Add Songs'}
              </Button>
              
              {addedSongs.length > 0 && (
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2"
                >
                  Save Changes ({addedSongs.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Song Library Section */}
        {showLibrary && (
          <div className="bg-neutral-800 rounded-lg p-6 mb-8">
            <h3 className="text-white text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaMusic className="text-blue-500" />
              Add Songs to Playlist
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Select songs from the library to add to this community playlist. 
              You&apos;ll earn tokens for your contributions!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {allSongs.map((song) => {
                const isAlreadyInPlaylist = currentPlaylist.songs.some(s => s.id === song.id);
                const isAddingThisSong = isAdding === song.id;
                
                return (
                  <div key={song.id} className="flex items-center gap-2 p-3 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition">
                    <div className="flex-1 min-w-0">
                      <MediaItem 
                        data={song} 
                        onClick={(id: string) => onPlay(id)}
                      />
                    </div>
                    <button
                      onClick={() => handleAddToPlaylist(song.id)}
                      disabled={isAlreadyInPlaylist || isAddingThisSong}
                      className={`px-3 py-1 rounded text-sm font-medium transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isAlreadyInPlaylist 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-400 text-white'
                      }`}
                    >
                      {isAddingThisSong ? "Adding..." : isAlreadyInPlaylist ? <FaCheck /> : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>

            {allSongs.length === 0 && (
              <div className="text-center py-8 text-neutral-400">
                <FaMusic className="text-4xl mx-auto mb-2" />
                <p>No songs available in library</p>
              </div>
            )}
          </div>
        )}

        {/* Songs List */}
        <div className="bg-neutral-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-2xl font-semibold">Playlist Songs</h3>
            <span className="text-neutral-400 text-sm">
              {currentPlaylist.songs.length} songs
            </span>
          </div>
          <PlaylistContent songs={currentPlaylist.songs} />
        </div>

        {/* Collaboration Info Section */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h3 className="text-white text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaPlus className="text-green-500" />
            Community Collaboration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">How it works</h4>
              <ul className="text-neutral-400 text-sm space-y-2">
                <li>• Click &apos;Add Songs&apos; to contribute to this playlist</li>
                <li>• Help build the perfect music collection</li>
                <li>• Discover new music from other contributors</li>
                <li>• Earn tokens for your contributions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Get started</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Add your favorite songs to this community playlist. 
                Your contributions will be visible to everyone and help shape this collection.
              </p>
              <Button 
                onClick={() => setShowLibrary(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Adding Songs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPageClient;