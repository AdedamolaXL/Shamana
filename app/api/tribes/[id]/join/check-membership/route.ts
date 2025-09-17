import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ isMember: false });
    }

    const { id: tribeId } = context.params;

    // Check if user is a member
    const { data: existingMember } = await supabase
      .from('tribe_members')
      .select('id')
      .eq('tribe_id', tribeId)
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      isMember: !!existingMember
    });

  } catch (error) {
    console.error('Membership check error:', error);
    return NextResponse.json({ isMember: false });
  }
}