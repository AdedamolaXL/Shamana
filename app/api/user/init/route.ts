import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function generateRandomUsername(): string {
  const adjectives = ['Cool', 'Funky', 'Epic', 'Groovy', 'Smooth', 'Vibey', 'Chill', 'Mellow'];
  const nouns = ['Listener', 'Melody', 'Rhythm', 'Beat', 'Tune', 'Harmony', 'Note', 'Sound'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check if user already has a username
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (existingUser?.username) {
      return NextResponse.json({ username: existingUser.username });
    }

    // Generate and set username
    const username = generateRandomUsername();
    
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to set username: ${error.message}`);
    }

    return NextResponse.json({ username });
  } catch (error) {
    console.error('User initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    );
  }
}