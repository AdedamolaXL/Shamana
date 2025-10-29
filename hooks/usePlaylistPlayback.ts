import { useState, useCallback } from "react";
import usePlayer from "./usePlayer";
import { Song } from "@/types";

interface UsePlaylistPlaybackProps {
  songs: Song[];
}

export const usePlaylistPlayback = ({ songs }: UsePlaylistPlaybackProps) => {
  const player = usePlayer();
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});

  const togglePlayState = useCallback((playlistId: string) => {
    setPlayingStates(prev => ({
      ...prev,
      [playlistId]: !prev[playlistId]
    }));
  }, []);

  const playPlaylist = useCallback((playlistId: string, firstSongId: string) => {
    // If this playlist is already the active one and playing, just toggle pause/play
    if (player.activeId && playingStates[playlistId] && player.isPlaying) {
      player.setIsPlaying(false); // Pause
      setPlayingStates(prev => ({
        ...prev,
        [playlistId]: false
      }));
    } 
    // If this playlist is already the active one but paused, resume
    else if (player.activeId && playingStates[playlistId] && !player.isPlaying) {
      player.setIsPlaying(true); // Resume
      setPlayingStates(prev => ({
        ...prev,
        [playlistId]: true
      }));
    }
    // Start playing a new playlist
    else {
      player.setId(firstSongId);
      player.setPlaylistContext(playlistId); 
      if (songs && songs.length > 0) {
        player.setIds(songs.map((song) => song.id));
      }
      player.setIsPlaying(true);
      
      // Set all other playlists to not playing, set current to playing
      setPlayingStates({ [playlistId]: true });
    }
  }, [player, songs, playingStates]);

  const isPlaylistPlaying = useCallback((playlistId: string) => {
    return playingStates[playlistId] || false;
  }, [playingStates]);

  return {
    playingStates,
    togglePlayState,
    playPlaylist,
    isPlaylistPlaying
  };
};