import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { activateHederaAccount } from '@/lib/hedera-account';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // First, check if environment variables are configured
    if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
      console.error('Hedera environment variables missing:', {
        hasOperatorId: !!process.env.HEDERA_OPERATOR_ID,
        hasOperatorKey: !!process.env.HEDERA_OPERATOR_KEY
      });
      
      return NextResponse.json(
        { 
          error: 'Hedera operator not configured',
          details: 'Check HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables'
        },
        { status: 500 }
      );
    }

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
    
    console.log('Activating account for user:', session.user.id);
    
    // Activate the user's Hedera account
    const result = await activateHederaAccount(session.user.id, amount || 10);
    
    console.log('Activation result:', result);
    
    // Validate the account ID format
    if (result.accountId && !isValidHederaAccountId(result.accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID format generated' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Account activation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to activate account',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function isValidHederaAccountId(accountId: string): boolean {
  const regex = /^0\.0\.\d+$/;
  return regex.test(accountId);
}