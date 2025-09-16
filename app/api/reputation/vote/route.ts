import { NextRequest, NextResponse } from 'next/server';
import { reputationSystem } from '@/lib/hedera-reputation';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playlistId, voteType } = await request.json();

    if (!playlistId || !voteType || (voteType !== 'upvote' && voteType !== 'downvote')) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get user's DID
    const userDID = await reputationSystem.getUserDID(session.user.id);

    const voteMessage = {
      type: voteType as 'upvote' | 'downvote',
      playlistId,
      voterId: session.user.id,
      voterDID: userDID,
      timestamp: Date.now(),
    };

    const transactionId = await reputationSystem.submitReputationMessage(voteMessage);

    return NextResponse.json({ 
      success: true, 
      transactionId,
      message: `Successfully ${voteType}d playlist` 
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit vote' },
      { status: 500 }
    );
  }
}