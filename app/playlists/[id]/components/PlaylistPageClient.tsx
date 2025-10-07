"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlaylistWithSongs, Song } from "@/types";
import { FaMusic, FaBookmark, FaHeart, FaPlay, FaClock, FaCrown, FaPause, FaGem } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import Image from "next/image";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
  allSongs: Song[];
}

interface Contributor {
  id?: string;
  username: string;
  email: string;
  is_curator: boolean;
  songs_added: number;
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
  const [contributors, setContributors] = useState<Contributor[]>([]); // New state for contributors
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [isControllingPlaylist, setIsControllingPlaylist] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const [isPulsing, setIsPulsing] = useState(true); 


  const router = useRouter();
  const { user } = useUser();
  const player = usePlayer();
  const onPlay = useOnPlay(allSongs);

useEffect(() => {
    const pulseTimer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000);

    return () => clearTimeout(pulseTimer);
  }, []);
  

  useEffect(() => {
    const isPlaylistActive = currentPlaylist.playlist_songs?.some(
      ps => ps.songs.id === player.activeId
    );
    
    setIsPlayingPlaylist(Boolean(isPlaylistActive && player.activeId !== undefined));
  }, [player.activeId, currentPlaylist.playlist_songs]);

    const getCreatorName = useCallback(() => {
    if (currentPlaylist.user?.username) return currentPlaylist.user.username;
    if (currentPlaylist.user?.email) return currentPlaylist.user.email.split("@")[0];
    return "Anonymous";
    }, [currentPlaylist.user])
  
   const getFallbackContributors = useCallback((): Contributor[] => {
    const contributors: Contributor[] = [];
    
    if (currentPlaylist.user) {
      contributors.push({
        id: currentPlaylist.user_id,
        username: getCreatorName(),
        email: currentPlaylist.user.email || '',
        is_curator: true,
        songs_added: currentPlaylist.playlist_songs?.length || 0
      });
    }
    
    return contributors;
  }, [currentPlaylist.user, currentPlaylist.user_id, currentPlaylist.playlist_songs?.length, getCreatorName]);

    const getPlaylistSongs = useCallback((): Song[] => {
    if (!currentPlaylist.playlist_songs) return [];
    
    return currentPlaylist.playlist_songs
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map(ps => ps.songs)
      .filter(song => song !== undefined) as Song[];
    }, [currentPlaylist.playlist_songs]);
  
    const fetchReputationData = useCallback(async () => {
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
    }, [playlist.id]);
  
  
   const checkUserVote = useCallback(async () => {
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
   }, [user, playlist.id]);
  
  
  const checkIfCollected = useCallback(async () => {
    if (!user || !playlist.id) {
      setIsCollected(false);
      return;
    }

    try {
      const response = await fetch(`/api/nft/check-collection?playlistId=${playlist.id}&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Collection check data:', data);
        setIsCollected(data.collected);
      } else {
        console.error('Failed to check collection status');
        setIsCollected(false);
      }
    } catch (error) {
      console.error("Error checking collection status:", error);
      setIsCollected(false);
    }
  }, [user, playlist.id]);


  const fetchCollectionCount = useCallback(async () => {
    if (!currentPlaylist.id) return;

    try {
      const response = await fetch(`/api/nft/collection-count?playlistId=${currentPlaylist.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Collection count data:', data);
        setCollectionCount(data.count || 0);
      } else {
        console.error('Failed to fetch collection count');
        setCollectionCount(0);
      }
    } catch (error) {
      console.error("Error fetching collection count:", error);
      setCollectionCount(0);
    }
  }, [currentPlaylist.id]);
 


  // Fetch contributors when component mounts
  useEffect(() => {
    const fetchContributors = async () => {
      if (!currentPlaylist.id) return;
      
      try {
        setIsLoadingContributors(true);
        const response = await fetch(`/api/playlists/${currentPlaylist.id}/contributors`);
        if (response.ok) {
          const data = await response.json();
          setContributors(data.contributors || []);
        } else {
          console.error('Failed to fetch contributors');
          setContributors(getFallbackContributors());
        }
      } catch (error) {
        console.error('Error fetching contributors:', error);
        setContributors(getFallbackContributors());
      } finally {
        setIsLoadingContributors(false);
      }
    };

    fetchContributors();
  }, [currentPlaylist.id, getFallbackContributors]);


    useEffect(() => {
    setCurrentPlaylist(playlist);
    checkIfCollected();
    fetchCollectionCount();
    fetchReputationData();
    checkUserVote();
  }, [playlist, user, checkIfCollected, fetchCollectionCount, fetchReputationData, checkUserVote]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playlist.id) {
        fetchCollectionCount();
      }
    }, 10000);


    return () => clearInterval(interval);
  }, [playlist.id, fetchCollectionCount]);

    useEffect(() => {
    const playlistSongs = getPlaylistSongs();
    const playlistSongIds = playlistSongs.map(song => song.id);
    
    const isPlaylistActive = player.activeId && playlistSongIds.includes(player.activeId);
    const isPlayingThisPlaylist = isPlaylistActive && player.isPlaying;
    
    setIsPlayingPlaylist(Boolean(isPlayingThisPlaylist));
    
    if (isControllingPlaylist && player.activeId && !playlistSongIds.includes(player.activeId)) {
      setIsControllingPlaylist(false);
    }
  }, [player.activeId, player.isPlaying, currentPlaylist.playlist_songs, isControllingPlaylist, getPlaylistSongs]);

  const handleCollectClick = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 10000);
    handleSavePlaylist();
  };
  

    // Handle playlist play/pause
  
  const handlePlayPausePlaylist = () => {
    const playlistSongs = getPlaylistSongs();
    
    if (playlistSongs.length === 0) {
      toast.error("No songs in playlist to play");
      return;
    }

    const playlistSongIds = playlistSongs.map(song => song.id);

    if (isPlayingPlaylist) {
      player.setIsPlaying(false);
      setIsPlayingPlaylist(false);
      toast("Playlist paused");
    } else {
      if (player.activeId && playlistSongIds.includes(player.activeId)) {
        player.setIsPlaying(true);
        setIsPlayingPlaylist(true);
        setIsControllingPlaylist(true);
        toast("Resuming playlist");
      } else {
        player.setIds(playlistSongIds);
        const firstSongId = playlistSongIds[0];
        player.setId(firstSongId);
        player.setIsPlaying(true);
        setIsPlayingPlaylist(true);
        setIsControllingPlaylist(true);
        toast.success(`Playing playlist: ${currentPlaylist.name}`);
      }
    }
  };
  
  
   // Handle when user clicks on individual songs
  const handleSongClick = (songId: string) => {
    const playlistSongs = getPlaylistSongs();
    const playlistSongIds = playlistSongs.map(song => song.id);
    
    // If this song is part of the current playlist, we're now controlling the playlist
    if (playlistSongIds.includes(songId)) {
      setIsControllingPlaylist(true);
      player.setIds(playlistSongIds);
    }
    
    // Play the specific song
    onPlay(songId);
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

  useEffect(() => {
    const playlistSongs = getPlaylistSongs();
    const playlistSongIds = playlistSongs.map(song => song.id);
    
    // Check if the current active song is in this playlist
    const isPlaylistActive = player.activeId && playlistSongIds.includes(player.activeId);
    
    // Check if the player is currently playing this playlist's songs
    const isPlayingThisPlaylist = isPlaylistActive && player.isPlaying;
    
    setIsPlayingPlaylist(Boolean(isPlayingThisPlaylist));
    
    // If we're controlling the playlist and the active song changes to outside the playlist, stop controlling
    if (isControllingPlaylist && player.activeId && !playlistSongIds.includes(player.activeId)) {
      setIsControllingPlaylist(false);
    }
  }, [player.activeId, player.isPlaying, currentPlaylist.playlist_songs, isControllingPlaylist, getPlaylistSongs]);

  const toggleCommentLike = (id: number) => setCommentLikes(prev => ({...prev, [id]: !prev[id]}));

  return (
    <div className="max-w-[1200px] mx-auto px-[15px]">
      {/* Hero Section with Actual Playlist Data */}
      <section className={`relative h-[300px] rounded-xl overflow-hidden my-10 flex items-end p-10 
        bg-gradient-to-br from-[#6a11cb] to-[#2575fc] lg:h-[250px] lg:p-8 md:h-[200px] md:my-5 md:p-5
        ${isPulsing ? 'animate-pulse-slow' : ''}`}>
        
        {/* CTA Button - Top Right */}
        {!isCreator && !isCollected && (
          <div className="absolute top-6 right-6 z-20">
            <button 
              onClick={handleCollectClick}
              className="group relative bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold py-3 px-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25 flex items-center gap-2 border-2 border-amber-300"
            >
              {/* Animated sparkle effect */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
              
              <FaGem className="text-amber-700 group-hover:text-amber-800 transition-colors" />
              <span className="whitespace-nowrap">Collect as NFT</span>
              
              {/* Hover tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Own this playlist forever! 🎵
              </div>
            </button>
          </div>
        )}

        {/* Collection Badge - If already collected */}
        {isCollected && (
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 border-2 border-emerald-300">
              <FaGem className="text-white" />
              <span className="whitespace-nowrap">Collected ✓</span>
            </div>
          </div>
        )}

        {/* Curator Badge - If user is creator */}
        {isCreator && (
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 border-2 border-pink-300">
              <FaCrown className="text-white" />
              <span className="whitespace-nowrap">Your Creation</span>
            </div>
          </div>
        )}

        {/* Existing banner content */}
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
            <div className="flex items-center gap-2">
              <FaGem className="text-sm" />
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

        {/* Animated overlay for pulsing effect */}
        {isPulsing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-xl"></div>
        )}
      </section>

      <section className="flex gap-8 mb-14 flex-col lg:flex-row">
        <div className="flex-[3] flex flex-col gap-8">
          <div className="bg-[#111] rounded-xl p-5">
            <div className="flex gap-2 mb-5">
              <Image 
                src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" 
                alt="You" 
                width={40}
                height={40}
                className="rounded-full object-cover shrink-0" 
              />
              <input 
                type="text" 
                className="flex-1 bg-[#222] border-0 rounded-full py-3 px-4 text-white focus:outline-none" 
                placeholder="Write a comment..." 
              />
            </div>
            
            {/* Playlist Actions */}
            <div className="flex gap-[15px] mb-[20px]">
             <button className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white  ${
                  isPlayingPlaylist 
                    ? ' text-white hover:bg-green-600' 
                    : ' text-white hover:bg-[#7a2bdb]'
                } ${getPlaylistSongs().length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={handlePlayPausePlaylist}
                disabled={getPlaylistSongs().length === 0}>
                {isPlayingPlaylist ? (
                  <>
                    <FaPause className="text-sm" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="text-sm" />
                    <span>Play</span>
                  </>
                )}
              </button> 

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
                <div key={playlistSong.songs.id} className="flex items-center gap-4 py-3 px-2 cursor-pointer border-b border-[#222] hover:bg-[#1a1a1a] transition"
                onClick={() => handleSongClick(playlistSong.songs.id)}
                >
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
            <div className="comments-section mt-10">
  {/* Header */}
  <div className="comments-header flex items-center justify-between mb-5">
    <h3 className="comments-title text-xl font-semibold">Comments</h3>
    <select className="comments-filter bg-[#222] border-0 rounded px-3 py-1 text-sm text-white">
      <option>Newest first</option>
      <option>Most liked</option>
    </select>
  </div>

  {/* Comments */}
  {[
    {id:1, name:'Sarah Chen', time:'2 hours ago', text:'This playlist is absolutely fire! The transition between tracks is seamless.', likes:24},
    {id:2, name:'Marcus Brown', time:'5 hours ago', text:'Needs more songs. Otherwise solid playlist.', likes:12},
    {id:3, name:'Jamal Williams', time:'1 day ago', text:'Discovered so many new artists from this playlist.', likes:42},
    {id:4, name:'Elena Rodriguez', time:'2 days ago', text:'The sequencing is perfect! Love how each track flows into the next.', likes:31}
  ].map(comment => (
    <div key={comment.id} className="comment flex gap-3 mb-6">
      {/* Avatar */}
      <Image
        src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg"
        alt="User"
        width={60}
        height={60}
        className="comment-avatar rounded-full object-cover shrink-0"
      />
      {/* Content */}
      <div className="comment-content flex-1">
        <div className="comment-header flex items-center gap-2 mb-1">
          <span className="commenter-name font-semibold">{comment.name}</span>
          <span className="comment-time text-xs text-gray-400">{comment.time}</span>
        </div>
        <p className="comment-text text-sm mb-2">{comment.text}</p>
        <div className="comment-actions flex gap-4 text-sm text-gray-400">
          <button
            className={`comment-action flex items-center gap-1 transition-colors hover:text-white ${
              commentLikes[comment.id] ? 'text-[#6a11cb]' : ''
            }`}
            onClick={() => toggleCommentLike(comment.id)}
          >
            <i className={`${commentLikes[comment.id] ? 'fas' : 'far'} fa-heart`} />
            <span>{comment.likes + (commentLikes[comment.id] ? 1 : 0)}</span>
          </button>
          <button className="comment-action flex items-center gap-1 transition-colors hover:text-white">
            <i className="far fa-comment" />
            <span>Reply</span>
          </button>
        </div>
      </div>
    </div>
  ))}
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
              <div className="space-y-3">
              {isLoadingContributors ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-neutral-700 rounded w-20 mb-1"></div>
                      <div className="h-2 bg-neutral-700 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : contributors.length > 0 ? (
                contributors.map((contributor) => (
                  <div key={contributor.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      contributor.is_curator 
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-500' 
                        : 'bg-gradient-to-br from-[#6a11cb] to-[#2575fc]'
                    }`}>
                      {contributor.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {contributor.username}
                        </span>
                        {contributor.is_curator && (
                          <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs">
                            <FaCrown size={10} />
                            Curator
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {contributor.songs_added} song{contributor.songs_added !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-neutral-400 text-sm">
                  <FaMusic className="mx-auto mb-2 text-lg" />
                  <p>No contributors yet</p>
                </div>
              )}
            </div>


            {contributors.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-700">
                <div className="text-xs text-neutral-400 text-center">
                  {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlaylistPageClient;
