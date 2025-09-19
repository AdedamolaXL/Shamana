import { NextRequest, NextResponse } from 'next/server';
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

    const { name, description, category } = await request.json();

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Check if tribe name already exists
    const { data: existingTribe } = await supabase
      .from('tribes')
      .select('id')
      .eq('name', name)
      .single();

    if (existingTribe) {
      return NextResponse.json(
        { error: 'A tribe with this name already exists' },
        { status: 409 }
      );
    }

    // Create the tribe
    const { data: tribe, error: tribeError } = await supabase
      .from('tribes')
      .insert({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        user_id: session.user.id
      })
      .select()
      .single();

    if (tribeError) {
      console.error('Tribe creation error:', tribeError);
      return NextResponse.json(
        { error: tribeError.message },
        { status: 500 }
      );
    }

    // Automatically make the creator a member
    const { error: memberError } = await supabase
      .from('tribe_members')
      .insert({
        tribe_id: tribe.id,
        user_id: session.user.id
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Continue anyway since the tribe was created successfully
    }

    return NextResponse.json(tribe);

  } catch (error) {
    console.error('Tribe creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}