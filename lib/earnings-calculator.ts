import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// lib/earnings-calculator.ts
export interface PlaylistValue {
  value: number;
  songsCount: number;
  totalMinutes: number;
  collectorsCount: number;
  rating: number;
  calculatedAt: Date;
}

export class EarningsCalculator {
  /**
   * Calculate playlist value using the formula: PV(t) = (Songs × Minutes) × (Collectors) × (Rating)
   */
  static async calculatePlaylistValue(
    playlistId: string, 
    supabase: any // Accept supabase client
  ): Promise<PlaylistValue> {
    // Get playlist with songs and their durations
    const { data: playlist, error } = await supabase
      .from('playlists')
      .select(`
        id,
        playlist_songs(
          position,
          songs!inner(
            id,
            duration
          )
        )
      `)
      .eq('id', playlistId)
      .single();

    if (error || !playlist) {
      throw new Error('Playlist not found');
    }

    // Calculate total songs and minutes
    const songsCount = playlist.playlist_songs?.length || 0;
    
    const totalSeconds = playlist.playlist_songs?.reduce((total: number, ps: any) => {
      // Handle both array and object formats
      let songDuration = 0;
      if (Array.isArray(ps?.songs)) {
        songDuration = ps.songs[0]?.duration || 0;
      } else if (ps?.songs && typeof ps.songs === 'object' && 'duration' in ps.songs) {
        songDuration = (ps.songs as any).duration || 0;
      } else {
        songDuration = 0;
      }
      return total + songDuration;
    }, 0) || 0;
    
    const totalMinutes = totalSeconds / 60;

    // Get number of collectors
    const { count: collectorsCount, error: collectorsError } = await supabase
      .from('playlist_collections')
      .select('*', { count: 'exact' })
      .eq('playlist_id', playlistId);

    if (collectorsError) {
      console.error('Error fetching collectors:', collectorsError);
    }

    // Calculate rating
    const rating = await this.calculatePlaylistRating(playlistId, supabase);

    // Calculate playlist value
    const value = (songsCount * totalMinutes) * (collectorsCount || 1) * rating;

    return {
      value,
      songsCount,
      totalMinutes,
      collectorsCount: collectorsCount || 0,
      rating,
      calculatedAt: new Date()
    };
  }

  /**
   * Calculate playlist rating (0.5 to 2.0 scale)
   */
  private static async calculatePlaylistRating(
    playlistId: string, 
    supabase: any
  ): Promise<number> {
    try {
      // Get reputation data directly from database
      const { data: reputationData, error } = await supabase
        .from('playlist_reputation')
        .select('upvotes, downvotes')
        .eq('playlist_id', playlistId)
        .single();

      if (error) {
        console.error('Error fetching reputation:', error);
        return 1.0; // Default rating
      }

      if (!reputationData) {
        return 1.0; // Default rating if no reputation data
      }

      const { upvotes = 0, downvotes = 0 } = reputationData;
      const totalVotes = upvotes + downvotes;
      
      if (totalVotes === 0) return 1.0;

      // Calculate score from -100 to 100 based on vote ratio
      const voteRatio = (upvotes - downvotes) / totalVotes;
      const score = voteRatio * 100;

      // Convert score (-100 to 100) to rating (0.5 to 2.0)
      return 1 + (score / 100);

    } catch (error) {
      console.error('Error calculating rating:', error);
      return 1.0; // Default rating
    }
  }

  /**
   * Calculate listener's share coefficient
   */
  static calculateShareCoefficient(songsContributed: number, totalSongs: number): number {
    if (totalSongs === 0) return 0;
    return songsContributed / totalSongs;
  }

  /**
   * Calculate listener's current entitlement
   */
  static calculateEntitlement(playlistValue: number, shareCoefficient: number): number {
    return playlistValue * shareCoefficient;
  }

  /**
   * Calculate claimable amount: ΔE(t) = E(t) - E(t_lastClaim)
   */
  static calculateClaimableAmount(currentEntitlement: number, lastClaimedValue: number): number {
    const claimable = currentEntitlement - lastClaimedValue;
    return Math.max(0, claimable); // Ensure non-negative
  }

  static async calculateArtistEarnings(
    playlistId: string, 
    claimAmount: number,
    supabase: any
  ): Promise<{ artistId: string; earnings: number }[]> {
    try {
      // Get all songs in playlist with their artists
      const { data: playlistSongs, error } = await supabase
        .from('playlist_songs')
        .select(`
          songs (
            id,
            artist_songs (
              artist_id
            )
          )
        `)
        .eq('playlist_id', playlistId);

      if (error || !playlistSongs) {
        console.error('Error fetching playlist songs for artist distribution:', error);
        return [];
      }

      // Count songs per artist
      const artistSongCounts = new Map<string, number>();
      let totalSongs = 0;

      playlistSongs.forEach((ps: { songs: any[]; }) => {
        const song = Array.isArray(ps.songs) ? ps.songs[0] : ps.songs;
        if (song?.artist_songs) {
          const artistSongs = Array.isArray(song.artist_songs) ? song.artist_songs : [song.artist_songs];
          artistSongs.forEach((as: { artist_id: any; }) => {
            const artistId = as.artist_id;
            artistSongCounts.set(artistId, (artistSongCounts.get(artistId) || 0) + 1);
            totalSongs++;
          });
        }
      });

      if (totalSongs === 0) return [];

      // Calculate artist earnings (50% of total claim amount)
      const totalArtistEarnings = claimAmount * 0.5;
      const artistEarnings: { artistId: string; earnings: number }[] = [];

      artistSongCounts.forEach((songCount, artistId) => {
        const artistShare = songCount / totalSongs;
        const artistEarning = totalArtistEarnings * artistShare;
        
        artistEarnings.push({
          artistId,
          earnings: artistEarning
        });
      });

      return artistEarnings;

    } catch (error) {
      console.error('Error calculating artist earnings:', error);
      return [];
    }
  }

  /**
   * Distribute earnings to artists after a claim
   */
  static async distributeArtistEarnings(
    playlistId: string,
    claimAmount: number,
    supabase: any
  ): Promise<void> {
    try {
      const artistEarnings = await this.calculateArtistEarnings(playlistId, claimAmount, supabase);

      // Update each artist's total earnings
      for (const { artistId, earnings } of artistEarnings) {
        if (earnings > 0) {
          // Get current artist earnings
          const { data: artist } = await supabase
            .from('artists')
            .select('total_earnings')
            .eq('id', artistId)
            .single();

          const newTotalEarnings = (artist?.total_earnings || 0) + earnings;

          // Update artist earnings
          await supabase
            .from('artists')
            .update({
              total_earnings: newTotalEarnings,
              last_updated_stats: new Date().toISOString()
            })
            .eq('id', artistId);

          // Record artist earnings transaction
          await supabase
            .from('artist_earnings')
            .insert({
              artist_id: artistId,
              playlist_id: playlistId,
              amount: earnings,
              distributed_at: new Date().toISOString()
            });

          console.log(`Distributed ${earnings} to artist ${artistId}`);
        }
      }
    } catch (error) {
      console.error('Error distributing artist earnings:', error);
    }
  }

}