import { ActivityItem } from "@/app/(site)/components/shared/types";
import { Song } from "@/types";

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
  error: { message: string; type?: string } | null;
  onPlaylistClick: (playlistId: string) => void;
  onPlaySong: (songId: string) => void;
  playingStates: { [key: string]: boolean };
  // onTogglePlayState: (playlistId: string) => void;
  onPlaylistPlay: (playlistId: string, firstSongId: string) => void; // Add this
  isPlaylistPlaying: (playlistId: string) => boolean; 
}

export interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
  onPlaylistClick: (playlistId: string) => void;
  onPlaySong: (songId: string) => void;
  onPlaylistPlay: (playlistId: string, firstSongId: string) => void; 
  isPlaylistPlaying: (playlistId: string) => boolean; 
}

export interface SongListProps {
  songs: string[];
  playlist?: any;
  onPlaySong: (songId: string) => void;
}

export interface WaveformThumbnailProps {
  gradientIndex: number;
  isPlaying: boolean;
  songCount: number;
  onThumbnailClick: () => void;
  onTogglePlay: () => void;
}