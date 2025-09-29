import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
  static async calculatePlaylistValue(playlistId: string): Promise<PlaylistValue> {
    const supabase = createServerComponentClient({ cookies });
    
    // Get playlist with songs and their durations
    const { data: playlist } = await supabase
      .from('playlists')
      .select(`
        id,
        playlist_songs(
          position,
          songs(duration)
        )
      `)
      .eq('id', playlistId)
      .single();

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Calculate total songs and minutes
    const songsCount = playlist.playlist_songs?.length || 0;
    const totalSeconds = playlist.playlist_songs?.reduce((total, ps) => {
   const songData = Array.isArray(ps.songs) ? ps.songs[0] : ps.songs;
      return total + (songData?.duration || 0);
}, 0) || 0;
    const totalMinutes = totalSeconds / 60;

    // Get number of collectors
    const { count: collectorsCount } = await supabase
      .from('playlist_collections')
      .select('*', { count: 'exact' })
      .eq('playlist_id', playlistId);

    // Calculate rating (simplified - you can enhance this with your reputation system)
    const rating = await this.calculatePlaylistRating(playlistId);

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
   * This can be enhanced with your reputation system
   */
  private static async calculatePlaylistRating(playlistId: string): Promise<number> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      // Get upvotes/downvotes from reputation system
      const response = await fetch(`http://localhost:3000/api/reputation/playlist/${playlistId}`);
      if (response.ok) {
        const reputation = await response.json();
        const score = reputation.reputation?.score || 0;
        
        // Convert score (-100 to 100) to rating (0.5 to 2.0)
        return 1 + (score / 100);
      }
    } catch (error) {
      console.error('Error fetching reputation:', error);
    }

    // Default rating if reputation system is unavailable
    return 1.0;
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
}