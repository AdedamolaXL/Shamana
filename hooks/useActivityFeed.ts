import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { ActivityItem } from '@/app/(site)/components/shared/types';

export const useActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient();

  const fetchRecentActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent playlist creations with their songs (most recent songs first)
      const { data: playlists, error: playlistError } = await supabaseClient
        .from('playlists')
        .select(`
          *,
          user:users(username, email),
          playlist_songs(
            position,
            added_at,
            songs(title, author, id),
            user:users(username, email)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (playlistError) throw playlistError;

      // Fetch recent song additions with playlist and user info
      const { data: recentAdditions, error: additionsError } = await supabaseClient
        .from('playlist_songs')
        .select(`
          added_at,
          user:users(username, email),
          songs(title, author, id),
          playlists(
            name, 
            id, 
            user:users(username, email),
            playlist_songs(
              position,
              added_at,
              songs(title, author, id)
            )
          )
        `)
        .order('added_at', { ascending: false })
        .limit(10);

      if (additionsError) throw additionsError;

      // Transform playlist creations
      const playlistActivities: ActivityItem[] = (playlists || []).map((playlist) => {
        // Sort songs by added_at timestamp (most recent first)
        const sortedPlaylistSongs = playlist.playlist_songs
          ? [...playlist.playlist_songs].sort((a: any, b: any) => {
              const dateA = new Date(a.added_at || 0).getTime();
              const dateB = new Date(b.added_at || 0).getTime();
              return dateB - dateA; // Most recent first
            })
          : [];

        const songs = sortedPlaylistSongs.map((ps: { songs: { title: any; author: any; }; }) => 
          `${ps.songs.title} - ${ps.songs.author}`
        );

        return {
          type: "playlist",
          user: playlist.user?.username || playlist.user?.email?.split('@')[0] || "Anonymous",
          action: "created",
          playlistName: playlist.name,
          details: `${playlist.user?.username || playlist.user?.email?.split('@')[0] || "Anonymous"} is curating a new playlist called ${playlist.name}`,
          playlistId: playlist.id,
          timestamp: formatTimestamp(playlist.created_at),
          playlist: {
            ...playlist,
            playlist_songs: sortedPlaylistSongs // Use sorted playlist songs
          },
          songs: songs
        };
      });

      // Transform song additions
      const songAdditionActivities: ActivityItem[] = (recentAdditions || []).map((addition) => {
        const playlist = addition.playlists;
        const contributor = addition.user?.username || addition.user?.email?.split('@')[0] || "Anonymous";
        const playlistOwner = Array.isArray(playlist?.user) 
          ? playlist.user[0]?.username || playlist.user[0]?.email?.split('@')[0] || "Anonymous"
          : playlist?.user?.username || playlist?.user?.email?.split('@')[0] || "Anonymous";

        // Sort songs by added_at timestamp (most recent first)
        const sortedPlaylistSongs = playlist?.playlist_songs
          ? [...playlist.playlist_songs].sort((a: any, b: any) => {
              const dateA = new Date(a.added_at || 0).getTime();
              const dateB = new Date(b.added_at || 0).getTime();
              return dateB - dateA; // Most recent first
            })
          : [];

        const songs = sortedPlaylistSongs.map((ps: { songs: { title: any; author: any; }; }) => 
          `${ps.songs.title} - ${ps.songs.author}`
        );

        return {
          type: "song_addition",
          user: playlistOwner,
          action: "added",
          playlistName: playlist?.name || "Unknown Playlist",
          details: `${contributor} is contributing to ${playlistOwner}'s ${playlist?.name} playlist`,
          playlistId: playlist?.id,
          timestamp: formatTimestamp(addition.added_at),
          playlist: {
            ...playlist,
            playlist_songs: sortedPlaylistSongs // Use sorted playlist songs
          },
          songs: songs,
          addedSong: addition.songs?.title,
          addedSongAuthor: contributor,
          addedSongId: addition.songs?.id
        };
      });

      // Combine and sort by timestamp
      const allActivities = [...playlistActivities, ...songAdditionActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    fetchRecentActivities();

    const songSubscription = supabaseClient
      .channel('playlist_songs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'playlist_songs'
        },
        () => {
          fetchRecentActivities();
        }
      )
      .subscribe();

    const playlistSubscription = supabaseClient
      .channel('playlists_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'playlists'
        },
        () => {
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      songSubscription.unsubscribe();
      playlistSubscription.unsubscribe();
    };
  }, [fetchRecentActivities, supabaseClient]);

  return { activities, isLoading, refetch: fetchRecentActivities };
};

const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return "Just now";
  
  const createdTime = new Date(timestamp).getTime();
  const now = Date.now();
  const diffInMs = now - createdTime;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};