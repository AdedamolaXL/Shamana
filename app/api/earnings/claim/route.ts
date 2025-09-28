import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { EarningsCalculator } from "@/lib/earnings-calculator";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playlistId } = await req.json();

    if (!playlistId) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    // Get or create earnings record for this user and playlist
    const { data: earnings, error: earningsError } = await supabase
      .from('playlist_earnings')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('playlist_id', playlistId)
      .single();

    // If no record exists and user hasn't contributed, they can't claim
    if (earningsError && earningsError.code === 'PGRST116') {
      return NextResponse.json({ 
        error: "No contributions found for this playlist" 
      }, { status: 400 });
    }

    // Calculate current playlist value
    const playlistValue = await EarningsCalculator.calculatePlaylistValue(playlistId);

    // Calculate share coefficient
    const shareCoefficient = EarningsCalculator.calculateShareCoefficient(
      earnings?.songs_contributed || 0,
      playlistValue.songsCount
    );

    // Calculate current entitlement
    const currentEntitlement = EarningsCalculator.calculateEntitlement(
      playlistValue.value,
      shareCoefficient
    );

    // Calculate claimable amount
    const claimableAmount = EarningsCalculator.calculateClaimableAmount(
      currentEntitlement,
      earnings?.last_claimed_value || 0
    );

    if (claimableAmount <= 0) {
      return NextResponse.json({ 
        error: "No claimable earnings at this time",
        currentEntitlement,
        lastClaimed: earnings?.last_claimed_value || 0
      }, { status: 400 });
    }

    // Mint tokens to user
    const tokenId = process.env.HEDERA_FT_TOKEN_ID;
    if (!tokenId) {
      return NextResponse.json({ error: "Token ID not configured" }, { status: 500 });
    }

    const mintResponse = await fetch(new URL('/api/token/mint', req.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        tokenId: tokenId,
        amount: Math.floor(claimableAmount), // Round to whole tokens
        playlistId: playlistId,
        claimType: 'earnings'
      }),
    });

    if (!mintResponse.ok) {
      const error = await mintResponse.json();
      throw new Error(error.error || "Token minting failed");
    }

    const mintResult = await mintResponse.json();

    // Update earnings record
    const { error: updateError } = await supabase
      .from('playlist_earnings')
      .upsert({
        id: earnings?.id,
        user_id: session.user.id,
        playlist_id: playlistId,
        songs_contributed: earnings?.songs_contributed || 0,
        last_claimed_value: currentEntitlement,
        total_claimed: (earnings?.total_claimed || 0) + claimableAmount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,playlist_id'
      });

    if (updateError) {
      console.error("Failed to update earnings record:", updateError);
    }

    // Record the claim
    const { error: claimError } = await supabase
      .from('earnings_claims')
      .insert({
        user_id: session.user.id,
        playlist_id: playlistId,
        claim_amount: claimableAmount,
        playlist_value_at_claim: playlistValue.value,
        songs_contributed_at_claim: earnings?.songs_contributed || 0,
        total_songs_at_claim: playlistValue.songsCount,
        collectors_at_claim: playlistValue.collectorsCount,
        rating_at_claim: playlistValue.rating,
        claimed_at: new Date().toISOString()
      });

    if (claimError) {
      console.error("Failed to record claim:", claimError);
    }

    return NextResponse.json({
      success: true,
      claimableAmount,
      currentEntitlement,
      lastClaimedValue: earnings?.last_claimed_value || 0,
      shareCoefficient,
      playlistValue: playlistValue.value,
      mintResult
    });

  } catch (error: any) {
    console.error("Earnings claim error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to claim earnings" },
      { status: 500 }
    );
  }
}