import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  Client,
  Hbar,
  AccountId,
  PrivateKey,
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";
import { activateHederaAccount } from '@/lib/hedera-account';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount = 1, playlistId } = await request.json();

    // If playlistId is provided, verify the user has contributed to it
    if (playlistId) {
      // Check for recent contributions by this user (within the last 5 minutes)
      const { data: contributions, error: contributionError } = await supabase
        .from('playlist_songs')
        .select('id, added_at')
        .eq('playlist_id', playlistId)
        .eq('user_id', session.user.id)
        .order('added_at', { ascending: false })
        .limit(5);

      if (contributionError) {
        console.error('Error checking contributions:', contributionError);
        return NextResponse.json({ error: 'Failed to verify contributions' }, { status: 500 });
      }

      // Check for recent contributions (within the last 5 minutes)
      const recentContributions = contributions?.filter(contribution => {
        if (!contribution.added_at) return true; // If no timestamp, assume it's recent
        const contributionTime = new Date(contribution.added_at).getTime();
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        return contributionTime > fiveMinutesAgo;
      });

      if (!recentContributions || recentContributions.length === 0) {
        console.log('No recent contributions found for user:', session.user.id);
        return NextResponse.json({ 
          error: 'No recent contributions found for this playlist. Please add songs and try again.' 
        }, { status: 403 });
      }

      console.log(`Found ${recentContributions.length} recent contributions, allowing token minting`);
    }

    // Activate user's Hedera account if needed
    const activationResult = await activateHederaAccount(session.user.id, 5);
    const recipientAccountId = activationResult.accountId;

    // Initialize Hedera client
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
    const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY!);
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    client.setDefaultMaxTransactionFee(new Hbar(20));

    // Get FT token ID from environment
    const ftTokenId = process.env.HEDERA_FT_TOKEN_ID;
    if (!ftTokenId) {
      return NextResponse.json({ error: 'FT token not configured' }, { status: 500 });
    }

    // Mint FT tokens
    const mintTx = await new TokenMintTransaction()
      .setTokenId(ftTokenId)
      .setAmount(amount)
      .freezeWith(client);

    const mintTxSign = await mintTx.sign(operatorKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    await mintTxSubmit.getReceipt(client);

    // Transfer to user
    const transferTx = await new TransferTransaction()
      .addTokenTransfer(
        ftTokenId,
        operatorId,
        -amount
      )
      .addTokenTransfer(
        ftTokenId,
        AccountId.fromString(recipientAccountId),
        amount
      )
      .freezeWith(client);

    const transferTxSign = await transferTx.sign(operatorKey);
    const transferSubmit = await transferTxSign.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    return NextResponse.json({
      success: true,
      amount,
      recipientAccountId,
      transactionId: transferSubmit.transactionId.toString()
    });

  } catch (error) {
    console.error('FT minting error:', error);
    return NextResponse.json(
      { error: 'Failed to mint tokens' },
      { status: 500 }
    );
  }
}