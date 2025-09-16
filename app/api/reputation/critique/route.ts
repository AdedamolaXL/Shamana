import { NextRequest, NextResponse } from 'next/server';
import { reputationSystem, ReputationCritique } from '@/lib/hedera-reputation';
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

    const { playlistId, comment, rating } = await request.json();

    if (!playlistId || !comment) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get user's DID
    const userDID = await reputationSystem.getUserDID(session.user.id);

    // Explicitly type the critique message to ensure proper type inference
    const critiqueMessage: ReputationCritique = {
      type: 'critique' as const, // Use 'as const' to ensure literal type
      playlistId,
      criticId: session.user.id,
      criticDID: userDID,
      comment,
      rating: rating || undefined,
      timestamp: Date.now(),
    };

    const transactionId = await reputationSystem.submitReputationMessage(critiqueMessage);

    return NextResponse.json({ 
      success: true, 
      transactionId,
      message: 'Critique submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting critique:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit critique' },
      { status: 500 }
    );
  }
}