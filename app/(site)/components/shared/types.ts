import { PlaylistWithSongs, Song } from "@/types";
import { Session } from "@supabase/auth-helpers-nextjs";

export interface ActivityItem {
  type: "playlist" | "song_addition";
  user: string;
  action: string;
  playlistName: string;
  details: string;
  playlistId?: string;
  timestamp: string;
  playlist?: any; // PlaylistWithSongs or similar
  songs?: string[];
  addedSong?: string;
  addedSongAuthor?: string;
  addedSongId?: string;
}

export interface HomeClientProps {
  session: Session | null;
  initialPlaylists: PlaylistWithSongs[];
  initialSongs: Song[];
}

export interface ErrorState {
  message: string;
  type?: 'playlists' | 'songs';
}