"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlaylistWithSongs, Song } from "@/types";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import Image from "next/image";
import { PlaylistHero } from "./PlaylistHero";
import { PlaylistActions } from "./PlaylistActions";
import { PlaylistSongList } from "./PlaylistSongList";
import { PlaylistSidebar } from "./PlaylistSidebar";
import { PlaylistComments } from "./PlaylistComments";

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
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [isControllingPlaylist, setIsControllingPlaylist] = useState(false);
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
  

  // Handle playlist play/pause - UPDATED
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
        player.setPlaylistContext(currentPlaylist.id); // SET PLAYLIST CONTEXT
        const firstSongId = playlistSongIds[0];
        player.setId(firstSongId);
        player.setIsPlaying(true);
        setIsPlayingPlaylist(true);
        setIsControllingPlaylist(true);
        toast.success(`Playing playlist: ${currentPlaylist.name}`);
      }
    }
  };
  
  
  // Handle when user clicks on individual songs - UPDATED
  const handleSongClick = (songId: string) => {
    const playlistSongs = getPlaylistSongs();
    const playlistSongIds = playlistSongs.map(song => song.id);
    
    // If this song is part of the current playlist, we're now controlling the playlist
    if (playlistSongIds.includes(songId)) {
      setIsControllingPlaylist(true);
      player.setIds(playlistSongIds);
      player.setPlaylistContext(currentPlaylist.id); // SET PLAYLIST CONTEXT
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

    if (voteType === 'upvote') {
      if (userVote === 'downvote') {
        setReputationData(prev => ({
          ...prev,
          score: prev.score + 20,
          upvotes: prev.upvotes + 1,
          downvotes: prev.downvotes - 1,
          totalVotes: prev.totalVotes
        }));
      } else if (userVote === null) {
        setReputationData(prev => ({
          ...prev,
          score: prev.score + 10,
          upvotes: prev.upvotes + 1,
          totalVotes: prev.totalVotes + 1
        }));
      }
    } else if (voteType === 'downvote') {
      if (userVote === 'upvote') {
        setReputationData(prev => ({
          ...prev,
          score: prev.score - 20,
          upvotes: prev.upvotes - 1,
          downvotes: prev.downvotes + 1,
          totalVotes: prev.totalVotes
        }));
      } else if (userVote === null) {
        setReputationData(prev => ({
          ...prev,
          score: prev.score - 10,
          downvotes: prev.downvotes + 1,
          totalVotes: prev.totalVotes + 1
        }));
      }
    }

    if (userVote === voteType) {
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
    
    const totalSeconds = currentPlaylist.playlist_songs.reduce((total, playlistSong) => {
        return total + (playlistSong.songs.duration || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

  const isCreator = user && currentPlaylist.user_id === user.id;

  const availableSongs = allSongs.filter(
    (song) => !currentPlaylist.playlist_songs?.some((ps) => ps.songs.id === song.id)
  );

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

  

  return (
      <div className="max-w-[1200px] mx-auto px-[15px]">
      <PlaylistHero
        playlist={currentPlaylist}
        isCreator={!!isCreator}
        isCollected={isCollected}
        isPulsing={isPulsing}
        collectionCount={collectionCount}
        reputationData={reputationData}
        getCreatorName={getCreatorName}
        onCollectClick={handleCollectClick}
        calculateDuration={calculateDuration}
      />

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
            
            <PlaylistActions
              isPlayingPlaylist={isPlayingPlaylist}
              userVote={userVote}
              isVoting={isVoting}
              isCollected={isCollected}
              isSaving={isSaving}
              reputationData={reputationData}
              onPlayPausePlaylist={handlePlayPausePlaylist}
              onVote={handleVote}
              onSavePlaylist={handleSavePlaylist}
              hasSongs={getPlaylistSongs().length > 0}
            />

            <PlaylistSongList
              playlist={currentPlaylist}
              onSongClick={handleSongClick}
              formatDuration={formatDuration}
            />

            <PlaylistComments />
          </div>
        </div>

        <div className="flex-[1] flex flex-col gap-[30px]">
          <PlaylistSidebar
            availableSongs={availableSongs}
            onAddToPlaylist={handleAddToPlaylist}
            isAdding={isAdding}
            playlistId={currentPlaylist.id}
          />
        </div>
      </section>
    </div>
  );
};

export default PlaylistPageClient;