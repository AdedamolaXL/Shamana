import { NextResponse } from "next/server";
import { mintFungible } from "@/lib/hedera-tokens";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, tokenId, amount, playlistId, claimType } = await req.json();

    if (!userId || !tokenId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get recipient's Hedera account from database 
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('hedera_account_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.hedera_account_id) {
      return NextResponse.json(
        { error: "User does not have a Hedera account. Please contact support." },
        { status: 400 }
      );
    }

    const recipientAccountId = user.hedera_account_id;
    console.log(`Minting ${amount} tokens for account: ${recipientAccountId}`);

    // Mint and transfer fungible tokens
    const result = await mintFungible(tokenId, amount, recipientAccountId);

    // Record the minting transaction if it's for playlist earnings
    if (playlistId && claimType === 'earnings') {
      const { error: insertError } = await supabase
        .from('token_mints')
        .insert({
          user_id: userId,
          playlist_id: playlistId,
          amount: amount,
          token_id: tokenId,
          transaction_id: result.transactionId,
          minted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to record token mint:', insertError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      ...result,
      recipientAccountId 
    });
  } catch (err: any) {
    console.error("Token minting error:", err);
    return NextResponse.json(
      { error: err.message || "Token mint failed" },
      { status: 500 }
    );
  }
}