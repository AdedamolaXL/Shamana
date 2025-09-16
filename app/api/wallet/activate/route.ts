import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { activateHederaAccount } from '@/lib/hedera-account';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { amount } = await request.json();
    
    // Activate the user's Hedera account using the consolidated function
    const result = await activateHederaAccount(session.user.id, amount || 10);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Account activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate account' },
      { status: 500 }
    );
  }
}