import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { EarningsCalculator } from "@/lib/earnings-calculator";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's playlist earnings records
    const { data: earnings } = await supabase
      .from('playlist_earnings')
      .select(`
        *,
        playlists(name, created_at)
      `)
      .eq('user_id', session.user.id);

    if (!earnings) {
      return NextResponse.json({ earnings: [] });
    }

    // Calculate current entitlements and claimable amounts
    const earningsWithDetails = await Promise.all(
      earnings.map(async (earning) => {
        try {
          const playlistValue = await EarningsCalculator.calculatePlaylistValue(earning.playlist_id);
          const shareCoefficient = EarningsCalculator.calculateShareCoefficient(
            earning.songs_contributed,
            playlistValue.songsCount
          );
          const currentEntitlement = EarningsCalculator.calculateEntitlement(
            playlistValue.value,
            shareCoefficient
          );
          const claimableAmount = EarningsCalculator.calculateClaimableAmount(
            currentEntitlement,
            earning.last_claimed_value
          );

          const latestContribution = earning.playlist_songs?.[0]?.added_at || 
                                   earning.playlists?.created_at || 
                                   earning.updated_at;


          return {
            playlist_id: earning.playlist_id,
            playlist_name: earning.playlists?.name || 'Unknown Playlist',
            songs_contributed: earning.songs_contributed,
            last_claimed_value: earning.last_claimed_value,
            total_claimed: earning.total_claimed,
            current_entitlement: currentEntitlement,
            claimable_amount: claimableAmount,
            playlist_value: playlistValue.value,
            share_coefficient: shareCoefficient,
            last_updated: latestContribution
          };
        } catch (error) {
          console.error(`Error calculating earnings for playlist ${earning.playlist_id}:`, error);
          return {
            playlist_id: earning.playlist_id,
            playlist_name: earning.playlists?.name || 'Unknown Playlist',
            songs_contributed: earning.songs_contributed,
            last_claimed_value: earning.last_claimed_value,
            total_claimed: earning.total_claimed,
            current_entitlement: 0,
            claimable_amount: 0,
            playlist_value: 0,
            share_coefficient: 0,
            last_updated: new Date().toISOString()
          };
        }
      })
    );

    return NextResponse.json({ earnings: earningsWithDetails });

  } catch (error: any) {
    console.error("Error fetching playlist earnings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}