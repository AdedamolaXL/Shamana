import { NextRequest, NextResponse } from 'next/server';
import { createUserDid } from '@/lib/hedera-did';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Check if user already has a DID
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('hedera_did, hedera_public_key, hedera_private_key_encrypted')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
    }

    // If user already has a DID, return it instead of creating a new one
    if (existingUser?.hedera_did) {
      return NextResponse.json({
        success: true,
        did: existingUser.hedera_did,
        publicKey: existingUser.hedera_public_key,
        privateKey: existingUser.hedera_private_key_encrypted,
        alreadyExists: true
      });
    }

    const result = await createUserDid(userId, userEmail);
    
    return NextResponse.json({ ...result, alreadyExists: false });
  } catch (error) {
    console.error('DID creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create DID' },
      { status: 500 }
    );
  }
}