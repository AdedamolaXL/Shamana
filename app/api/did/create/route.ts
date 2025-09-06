// app/api/did/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUserDid } from '@/lib/hedera-did';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const result = await createUserDid(userId, userEmail);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('DID creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create DID' },
      { status: 500 }
    );
  }
}