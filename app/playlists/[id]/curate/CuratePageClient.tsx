"use client";

import Image from "next/image";
import PlaylistContent from "../../components/PlaylistContent";
import { useState } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { PlaylistWithSongs, Song } from "@/types";
import { MediaItem } from "@/components";
import useOnPlay from "@/hooks/useOnPlay";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface CuratePageClientProps {
  playlist: PlaylistWithSongs;
  allSongs: Song[];
  session: Session | null;
}

// Mock activity data
const mockActivities = [
  { user: "User123", action: "added", song: "Blinding Lights", time: "2 hours ago" },
  { user: "MusicLover", action: "added", song: "Save Your Tears", time: "5 hours ago" },
  { user: "DJ_Flow", action: "created", song: "this playlist", time: "1 day ago" },
];

const CuratePageClient: React.FC<CuratePageClientProps> = ({ playlist, allSongs, session }) => {
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [comment, setComment] = useState("");
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);
  const onPlay = useOnPlay(allSongs);
  const router = useRouter();

  const handleCritiqueClick = () => {
    setIsCritiquing(true);
  };

  const handleCommentSubmit = () => {
    console.log("Comment submitted:", comment);
    setComment("");
    setIsCritiquing(false);
    mockActivities.unshift({
      user: "CurrentUser",
      action: "commented",
      song: "on this playlist",
      time: "just now"
    });
  };

  const handleCancelCritique = () => {
    setIsCritiquing(false);
    setComment("");
  };

  const handleAddToPlaylist = async (songId: string) => {
  if (!session) {
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
    console.log('API Response:', { status: response.status, data });

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
      
      mockActivities.unshift({
        user: "You",
        action: "added",
        song: addedSong.title || "a song",
        time: "just now"
      });
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
    // This could be used to save reordering or other changes
    toast.success("Playlist updated successfully!");
  };

  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <div className="flex flex-col lg:flex-row p-6 gap-6">
        {/* Left column - Activity log (1/4 width) */}
        <div className="w-full lg:w-1/4 bg-neutral-800 rounded-lg p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-white text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {mockActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-xs font-bold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action} {" "}
                    <span className="font-medium">{activity.song}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Comment Box (appears when critiquing) */}
          {isCritiquing && (
            <div className="mt-6 pt-6 border-t border-neutral-700">
              <h3 className="text-white font-semibold mb-4">Add Your Critique</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this playlist..."
                className="w-full bg-neutral-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="flex-1 bg-green-500 text-black py-2 rounded-md text-sm font-medium hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  onClick={handleCancelCritique}
                  className="flex-1 bg-neutral-600 text-white py-2 rounded-md text-sm font-medium hover:bg-neutral-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Middle column - Playlist content (1/2 width) */}
        <div className="w-full lg:w-1/2">
          {/* Playlist header */}
          <div className="flex flex-col md:flex-row items-center gap-x-5 mb-6">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image 
                fill
                src={currentPlaylist.image_path || "/images/playlist.png"}
                alt="Playlist"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">Playlist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                {currentPlaylist.name}
              </h1>
              {currentPlaylist.description && (
                <p className="text-neutral-400 text-sm">
                  {currentPlaylist.description}
                </p>
              )}
              <div className="flex items-center gap-x-2 text-neutral-400 text-sm mt-2">
                <span>{currentPlaylist.songs.length} songs</span>
                <span>•</span>
                <span>Community playlist</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          {session && (
            <div className="mb-6">
              <div className="flex gap-4 flex-wrap">
                <button 
                  onClick={handleSaveChanges}
                  className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-md transition"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCritiqueClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Critique
                </button>
                <button 
                  onClick={() => router.push(`/playlists/${currentPlaylist.id}`)}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Back to Playlist
                </button>
              </div>
            </div>
          )}
          
          {/* Playlist content */}
          <PlaylistContent songs={currentPlaylist.songs} />
        </div>
        
        {/* Right column - Song library (1/4 width) */}
        <div className="w-full lg:w-1/4 bg-neutral-800 rounded-lg p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-white text-xl font-semibold mb-4">Song Library</h2>
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {allSongs.map((song) => {
              const isAlreadyInPlaylist = currentPlaylist.songs.some(s => s.id === song.id);
              const isAddingThisSong = isAdding === song.id;
              
              return (
                <div key={song.id} className="flex items-center gap-2 p-2 bg-neutral-700 rounded hover:bg-neutral-600 transition">
                  <div className="flex-1 min-w-0">
                    <MediaItem 
                      data={song} 
                      onClick={(id: string) => onPlay(id)}
                    />
                  </div>
                  <button
                    onClick={() => handleAddToPlaylist(song.id)}
                    disabled={isAlreadyInPlaylist || isAddingThisSong}
                    className="bg-green-500 text-black px-3 py-1 rounded text-sm font-medium hover:bg-green-400 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingThisSong ? "Adding..." : isAlreadyInPlaylist ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratePageClient;