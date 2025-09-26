"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlaylistWithSongs, Song } from "@/types";
import { FaMusic, FaBookmark, FaHeart, FaPlay, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import useOnPlay from "@/hooks/useOnPlay";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
  allSongs: Song[];
}

const PlaylistPageClient: React.FC<PlaylistPageClientProps> = ({ playlist, allSongs }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [addedSongs, setAddedSongs] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);
   const [reputationData, setReputationData] = useState({
    score: 0,
    upvotes: 0,
    downvotes: 0,
    critiques: 0,
    totalVotes: 0
  });
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const router = useRouter();
  const { user } = useUser();
  const onPlay = useOnPlay(allSongs);

  // Check if current user has collected this playlist and get collection count
  useEffect(() => {
    setCurrentPlaylist(playlist);
    checkIfCollected();
    fetchCollectionCount();
    fetchReputationData();
    checkUserVote();
  }, [playlist, user]);

  useEffect(() => {
  const interval = setInterval(() => {
    if (playlist.id) {
      fetchCollectionCount();
    }
  }, 10000); // Check every 10 seconds

  return () => clearInterval(interval);
}, [playlist.id]);

  const fetchReputationData = async () => {
    if (!playlist.id) return;

    try {
      const response = await fetch(`/api/reputation/playlist/${playlist.id}`);
      if (response.ok) {
        const data = await response.json();
        setReputationData(data.reputation || {
          score: 0,
          upvotes: 0,
          downvotes: 0,
          critiques: 0,
          totalVotes: 0
        });
      }
    } catch (error) {
      console.error("Error fetching reputation data:", error);
    }
  };

   const checkUserVote = async () => {
    if (!user || !playlist.id) {
      setUserVote(null);
      return;
    }

    try {
      const response = await fetch(`/api/reputation/playlist/${playlist.id}`);
      if (response.ok) {
        const data = await response.json();
        const userMessages = data.messages?.filter((msg: any) => 
          msg.voterId === user.id && (msg.type === 'upvote' || msg.type === 'downvote')
        ) || [];
        
        if (userMessages.length > 0) {
          setUserVote(userMessages[0].type);
          setIsLiked(userMessages[0].type === 'upvote');
        } else {
          setUserVote(null);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  // Update the checkIfCollected function to be more robust
const checkIfCollected = async () => {
  if (!user || !playlist.id) {
    setIsCollected(false);
    return;
  }

  try {
    const response = await fetch(`/api/nft/check-collection?playlistId=${playlist.id}&userId=${user.id}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Collection check data:', data); // Debug log
      setIsCollected(data.collected);
    } else {
      console.error('Failed to check collection status');
      setIsCollected(false);
    }
  } catch (error) {
    console.error("Error checking collection status:", error);
    setIsCollected(false);
  }
};

 // Update the fetchCollectionCount function
const fetchCollectionCount = async () => {
  if (!currentPlaylist.id) return;

  try {
    const response = await fetch(`/api/nft/collection-count?playlistId=${currentPlaylist.id}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Collection count data:', data); // Debug log
      setCollectionCount(data.count || 0);
    } else {
      console.error('Failed to fetch collection count');
      setCollectionCount(0);
    }
  } catch (error) {
    console.error("Error fetching collection count:", error);
    setCollectionCount(0);
  }
};

    const handleVote = async (voteType: 'upvote' | 'downvote') => {
  if (!user) {
    toast.error("Please sign in to vote");
    return;
  }

  if (!playlist.id) {
    toast.error("Playlist ID is required");
    return;
  }

  setIsVoting(true);
  try {
    const response = await fetch('/api/reputation/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playlistId: playlist.id,
        voteType: voteType
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit vote');
    }

    // Update local state with new weights (+10 for upvote, -10 for downvote)
    if (voteType === 'upvote') {
      if (userVote === 'downvote') {
        // Changing from downvote to upvote: +20 points (remove -10, add +10)
        setReputationData(prev => ({
          ...prev,
          score: prev.score + 20,
          upvotes: prev.upvotes + 1,
          downvotes: prev.downvotes - 1,
          totalVotes: prev.totalVotes
        }));
      } else if (userVote === null) {
        // New upvote: +10 points
        setReputationData(prev => ({
          ...prev,
          score: prev.score + 10,
          upvotes: prev.upvotes + 1,
          totalVotes: prev.totalVotes + 1
        }));
      }
    } else if (voteType === 'downvote') {
      if (userVote === 'upvote') {
        // Changing from upvote to downvote: -20 points (remove +10, add -10)
        setReputationData(prev => ({
          ...prev,
          score: prev.score - 20,
          upvotes: prev.upvotes - 1,
          downvotes: prev.downvotes + 1,
          totalVotes: prev.totalVotes
        }));
      } else if (userVote === null) {
        // New downvote: -10 points
        setReputationData(prev => ({
          ...prev,
          score: prev.score - 10,
          downvotes: prev.downvotes + 1,
          totalVotes: prev.totalVotes + 1
        }));
      }
    }

    // Handle unvoting (clicking the same vote type again)
    if (userVote === voteType) {
      // User is removing their vote
      const scoreChange = voteType === 'upvote' ? -10 : 10;
      setReputationData(prev => ({
        ...prev,
        score: prev.score + scoreChange,
        upvotes: voteType === 'upvote' ? prev.upvotes - 1 : prev.upvotes,
        downvotes: voteType === 'downvote' ? prev.downvotes - 1 : prev.downvotes,
        totalVotes: prev.totalVotes - 1
      }));
      setUserVote(null);
      setIsLiked(false);
    } else {
      setUserVote(voteType);
      setIsLiked(voteType === 'upvote');
    }

    toast.success(data.message || `Successfully ${voteType}d playlist`);
    
    // Refresh reputation data to ensure consistency
    setTimeout(() => {
      fetchReputationData();
    }, 500);

  } catch (error: any) {
    console.error('Error submitting vote:', error);
    toast.error(error.message || 'Failed to submit vote');
  } finally {
    setIsVoting(false);
  }
  };
  
  const formatDuration = (seconds: number = 0): string => {
    if (!seconds || seconds <= 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

  const calculateDuration = () => {
    if (!currentPlaylist.playlist_songs || currentPlaylist.playlist_songs.length === 0) {
        return '0:00';
    }
    
    // Sum up all song durations in seconds
    const totalSeconds = currentPlaylist.playlist_songs.reduce((total, playlistSong) => {
        return total + (playlistSong.songs.duration || 0);
    }, 0);
    
    // Convert to hours and minutes
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

  // Get creator name
  const getCreatorName = () => {
    if (currentPlaylist.user?.username) return currentPlaylist.user.username;
    if (currentPlaylist.user?.email) return currentPlaylist.user.email.split("@")[0];
    return "Anonymous";
  };

  // Check if current user is the creator
  const isCreator = user && currentPlaylist.user_id === user.id;

  // Songs not in the playlist
  const availableSongs = allSongs.filter(
    (song) => !currentPlaylist.playlist_songs?.some((ps) => ps.songs.id === song.id)
  );

  const handleLike = () => setIsLiked(!isLiked);

  const handleAddToPlaylist = async (songId: string) => {
    if (!user) {
      toast.error("Please sign in to add songs");
      return;
    }

    const isAlreadyInPlaylist = currentPlaylist.playlist_songs?.some((ps) => ps.songs.id === songId);
    if (isAlreadyInPlaylist) {
      toast.error("This song is already in the playlist");
      return;
    }

    setIsAdding(songId);
    try {
      const response = await fetch("/api/playlists/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: currentPlaylist.id, songId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add song");

      const addedSong = allSongs.find((song) => song.id === songId);
      if (addedSong) {
        setCurrentPlaylist((prev) => ({
          ...prev,
          playlist_songs: [
            ...(prev.playlist_songs || []),
            { position: prev.playlist_songs?.length ?? 0, songs: addedSong },
          ],
        }));
        setAddedSongs((prev) => [...prev, songId]);
      }

      toast.success("Song added to playlist!");
    } catch (error: any) {
      console.error("Error adding song:", error);
      toast.error(error.message || "Failed to add song");
    } finally {
      setIsAdding(null);
    }
  };

 const handleSavePlaylist = async () => {
  if (!user) {
    toast.error("Please sign in to collect this playlist");
    return;
  }

  if (isCreator) {
    toast.error("You cannot collect your own playlist");
    return;
  }

  if (isCollected) {
    toast.success("You already collected this playlist!");
    return;
  }

  setIsSaving(true);
  try {
    const response = await fetch("/api/nft/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playlistId: currentPlaylist.id,
        userId: user.id,
        userEmail: user.email,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to collect playlist");
    }

    // Refresh collection status and count with a small delay to ensure DB is updated
    setTimeout(async () => {
      await checkIfCollected();
      await fetchCollectionCount();
    }, 500);
    
    toast.success("Playlist collected as NFT! 🎉");
  } catch (error: any) {
    console.error("Error saving playlist:", error);
    toast.error(error.message || "Failed to collect playlist");
  } finally {
    setIsSaving(false);
  }
};


  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("Please sign in to save changes");
      return;
    }

    try {
      if (addedSongs.length > 0) {
        try {
          const rewardResponse = await fetch("/api/token/mint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: addedSongs.length,
              playlistId: currentPlaylist.id,
            }),
          });

          if (rewardResponse.ok) {
            toast.success(`Earned ${addedSongs.length} tokens for your contributions!`);
          } else {
            toast.success("Playlist updated successfully!");
          }
        } catch (err) {
          console.warn("Token minting error:", err);
          toast.success("Playlist updated successfully!");
        }
      } else {
        toast.success("Playlist updated successfully!");
      }

      setAddedSongs([]);
      router.refresh();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[15px]">
      {/* Hero Section with Actual Playlist Data */}
      <section className="relative h-[300px] rounded-xl overflow-hidden my-10 flex items-end p-10 
        bg-gradient-to-br from-[#6a11cb] to-[#2575fc] lg:h-[250px] lg:p-8 md:h-[200px] md:my-5 md:p-5">
        <div className="relative z-10 w-full">
          <h1 className="text-4xl font-bold mb-2 md:text-3xl">{currentPlaylist.name}</h1>
          <p className="text-lg mb-5 opacity-90 max-w-[600px] md:text-base">
            {currentPlaylist.description || `A curated playlist by ${getCreatorName()}`}
          </p>
          <div className="flex gap-5 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <i className="fas fa-music"></i>
              <span>{currentPlaylist.playlist_songs?.length || 0} songs</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-clock"></i>
              <span>{calculateDuration()}</span>
            </div>
            {/* <div className="flex items-center gap-1">
              <i className="fas fa-play"></i>
              <span>0 plays</span>
            </div> */}
            <div className="flex items-center gap-2">
              <FaBookmark className="text-sm" />
              <span>{collectionCount} collectors</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-star"></i>
              <span className={`font-bold ${reputationData.score > 0 ? 'text-green-500' : reputationData.score < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {reputationData.score}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-8 mb-14 flex-col lg:flex-row">
        <div className="flex-[3] flex flex-col gap-8">
          <div className="bg-[#111] rounded-xl p-5">
            <div className="flex gap-2 mb-5">
              <img 
                src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" 
                alt="You" 
                className="w-10 h-10 rounded-full object-cover shrink-0" 
              />
              <input 
                type="text" 
                className="flex-1 bg-[#222] border-0 rounded-full py-3 px-4 text-white focus:outline-none" 
                placeholder="Write a comment..." 
              />
            </div>
            
            {/* Playlist Actions */}
            <div className="flex gap-[15px] mb-[20px]">
              {/* <button className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white ${isLiked ? 'text-[#6a11cb]' : ''}`} onClick={handleLike}>
                <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
                <span>Like</span>
              </button> */}

               {/* Like/Upvote Button */}
              <button 
                className={`flex items-center gap-1 text-sm transition-colors ${
                  userVote === 'upvote' 
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-white'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleVote('upvote')}
                disabled={isVoting}
              >
                <FaHeart className={userVote === 'upvote' ? 'fill-current' : ''} />
                <span>
                  {isVoting ? 'Voting...' : userVote === 'upvote' ? 'Liked' : 'Like'}
                </span>
                {reputationData.upvotes > 0 && (
                  <span className="ml-1">({reputationData.upvotes})</span>
                )}
              </button>

              {/* Dislike/Downvote Button (optional) */}
              <button 
                className={`flex items-center gap-1 text-sm transition-colors ${
                  userVote === 'downvote' 
                    ? 'text-blue-500' 
                    : 'text-gray-400 hover:text-white'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleVote('downvote')}
                disabled={isVoting}
              >
                <i className={`fas fa-thumbs-down ${userVote === 'downvote' ? 'text-blue-500' : ''}`}></i>
                <span>
                  {isVoting ? 'Voting...' : userVote === 'downvote' ? 'Disliked' : 'Dislike'}
                </span>
                {reputationData.downvotes > 0 && (
                  <span className="ml-1">({reputationData.downvotes})</span>
                )}
              </button>



              <button 
                className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white ${
                isCollected ? 'text-green-500' : ''
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSavePlaylist}
                disabled={isSaving || isCollected}
              >
                <FaBookmark className={isCollected ? "text-green-500" : ""} />
                <span>
                  {isSaving ? 'Saving...' : isCollected ? 'Collected' : 'Collect Playlist'}
                </span>
              </button>
              <button className="flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white">
                <i className="fas fa-ellipsis-h"></i>
                <span>More</span>
              </button>
            </div>


            


            {/* Song List */}
            <div className="flex flex-col">
              {currentPlaylist.playlist_songs?.map((playlistSong, index) => (
                <div key={playlistSong.songs.id} className="flex items-center gap-4 py-3 px-2 cursor-pointer border-b border-[#222] hover:bg-[#1a1a1a] transition">
                  <span className="w-6 text-sm text-gray-400">{index + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{playlistSong.songs.title}</div>
                    <div className="text-xs text-gray-500">{playlistSong.songs.author}</div>
                  </div>
                  <span className="text-xs text-gray-400"> {formatDuration(playlistSong.songs.duration)}</span>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="text-gray-400 hover:text-white transition">
                      <i className="far fa-heart"></i>
                    </button>
                    <button className="text-gray-400 hover:text-white transition">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              ))}
              {(!currentPlaylist.playlist_songs || currentPlaylist.playlist_songs.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <FaMusic className="mx-auto mb-2 text-2xl" />
                  <p>No songs in this playlist yet</p>
                  <p className="text-sm">Be the first to add songs!</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6 border-t border-[#222] pt-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[1.2rem] font-semibold">Comments</h3>
                <select className="bg-transparent border border-[#333] text-[#ccc] px-3 py-1 rounded-[15px] text-[0.8rem] cursor-pointer">
                  <option>Newest first</option>
                  <option>Most liked</option>
                </select>
              </div>
              
              {/* Placeholder comments - you might want to fetch real comments */}
              <div className="text-center py-4 text-gray-400">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-[1] flex flex-col gap-[30px]">
          <div className="bg-[#111] rounded-xl p-5">
            <h3 className="text-[1.2rem] font-semibold mb-[15px]">Song Queue</h3>
            <div className="mb-[25px]">
              {availableSongs.slice(0, 16).map((song, i) => (
                <div key={song.id} className="flex items-center gap-[10px] py-2 border-b border-[#222] last:border-none">
                  <div className="flex-1">
                    <div className="text-[0.9rem] font-medium">
                      {song.title}
                    </div>
                    <div className="text-[0.8rem] text-[#999]">{song.author}</div>
                  </div>
                  <span className="text-[0.8rem] text-[#999]"> {formatDuration(song.duration)}</span>
                  <button
                    className="text-sm text-[#6a11cb] hover:text-white transition-colors"
                    onClick={() => handleAddToPlaylist(song.id)}
                    disabled={isAdding === song.id}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              ))}
              {availableSongs.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No songs available to add</p>
              )}
            </div>

            {/* Contributors Section */}
            <h3 className="text-[1.2rem] font-semibold mb-[15px]">Contributors</h3>
            <div className="flex my-[15px] mb-[25px]">
              {/* Placeholder for contributors - you might want to fetch real contributor data */}
              <div className="w-[35px] h-[35px] rounded-full bg-[#6a11cb] flex items-center justify-center text-[0.8rem] text-white">
                {getCreatorName().charAt(0).toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 ml-2 flex items-center">
                Curated by {getCreatorName()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlaylistPageClient;
