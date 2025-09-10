export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      liked_songs: {
        Row: {
          created_at: string | null
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_songs_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liked_songs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string | null
          song_id: string | null
          position: number | null
          added_at: string | null
        }
        Insert: {
          id?: string
          playlist_id?: string | null
          song_id?: string | null
          position?: number | null
          added_at?: string | null
        }
        Update: {
          id?: string
          playlist_id?: string | null
          song_id?: string | null
          position?: number | null
          added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      playlists: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          image_path: string | null
          created_at: string | null
          updated_at: string | null
          nft_token_id: string | null
          nft_serial_number: string | null
          nft_metadata_uri: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          image_path?: string | null
          created_at?: string | null
          updated_at?: string | null
          nft_token_id?: string | null
          nft_serial_number?: string | null
          nft_metadata_uri?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          image_path?: string | null
          created_at?: string | null
          updated_at?: string | null
          nft_token_id?: string | null
          nft_serial_number?: string | null
          nft_metadata_uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      songs: {
        Row: {
          id: string
          user_id: string | null
          author: string | null
          title: string | null
          song_path: string | null
          image_path: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          author?: string | null
          title?: string | null
          song_path?: string | null
          image_path?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          author?: string | null
          title?: string | null
          song_path?: string | null
          image_path?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          hedera_public_key: string | null
          hedera_private_key_encrypted: string | null
          hedera_evm_address: string | null
          hedera_did: string | null
          did_created_at: string | null
          hedera_account_id: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          hedera_public_key?: string | null
          hedera_private_key_encrypted?: string | null
          hedera_evm_address?: string | null
          hedera_did?: string | null
          did_created_at?: string | null
          hedera_account_id?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          hedera_public_key?: string | null
          hedera_private_key_encrypted?: string | null
          hedera_evm_address?: string | null
          hedera_did?: string | null
          did_created_at?: string | null
          hedera_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}