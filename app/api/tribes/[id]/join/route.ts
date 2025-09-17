import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Context {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tribeId } = context.params;

    if (!tribeId) {
      return NextResponse.json(
        { error: 'Tribe ID is required' },
        { status: 400 }
      );
    }

    // Check if tribe exists
    const { data: tribe, error: tribeError } = await supabase
      .from('tribes')
      .select('id')
      .eq('id', tribeId)
      .single();

    if (tribeError || !tribe) {
      return NextResponse.json(
        { error: 'Tribe not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('tribe_members')
      .select('id')
      .eq('tribe_id', tribeId)
      .eq('user_id', session.user.id)
      .single();

    let action: 'joined' | 'left';
    
    if (existingMember) {
      // Leave the tribe
      const { error: leaveError } = await supabase
        .from('tribe_members')
        .delete()
        .eq('tribe_id', tribeId)
        .eq('user_id', session.user.id);

      if (leaveError) {
        console.error('Leave tribe error:', leaveError);
        return NextResponse.json(
          { error: leaveError.message },
          { status: 500 }
        );
      }
      action = 'left';
    } else {
      // Join the tribe
      const { error: joinError } = await supabase
        .from('tribe_members')
        .insert({
          tribe_id: tribeId,
          user_id: session.user.id
        });

      if (joinError) {
        console.error('Join tribe error:', joinError);
        return NextResponse.json(
          { error: joinError.message },
          { status: 500 }
        );
      }
      action = 'joined';
    }

    // Get updated member count
    const { count: memberCount } = await supabase
      .from('tribe_members')
      .select('*', { count: 'exact' })
      .eq('tribe_id', tribeId);

    return NextResponse.json({
      action,
      memberCount: memberCount || 0,
      isMember: action === 'joined'
    });

  } catch (error) {
    console.error('Tribe join/leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}