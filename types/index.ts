export interface UserDetails {
    id: string;
    full_name?: string;
    username?: string; 
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
    hedera_public_key?: string;
    hedera_private_key_encrypted?: string;
    hedera_account_id?: string;
    hedera_evm_address?: string;
    hedera_did?: string;
    did_created_at?: string;
}

export interface Song {
    id: string ,
    user_id?: string,
    author?: string,
    title?: string,
    song_path?: string,
    image_path?: string
    created_at?: string;
}

export interface Playlist {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  image_path?: string | null;
  created_at?: string;
  updated_at?: string;
  nft_token_id?: string;
  nft_serial_number?: string;
  nft_metadata_uri?: string; // Add this field
}

export interface PlaylistUser {
  username: string;
  email: string;
}

export interface PlaylistSongEntry {
  position: number;
  songs: Song;
}

export interface PlaylistWithSongs extends Playlist {
  user?: PlaylistUser; 
  playlist_songs?: PlaylistSongEntry[];
  song?: Song[]; 
}

export interface PlaylistSong {
  id: string;
  playlist_id?: string;
  song_id?: string;
  position?: number;
  added_at?: string;
}

export interface LikedSong {
  user_id: string;
  song_id: string;
  created_at?: string;
}