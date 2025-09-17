import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get all tribes with member counts
    const { data: tribes, error } = await supabase
      .from('tribes')
      .select(`
        *,
        tribe_members(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tribes:', error);
      return NextResponse.json([], { status: 200 });
    }

    // Format the data to include member count
    const tribesWithCounts = tribes.map(tribe => ({
      ...tribe,
      memberCount: tribe.tribe_members[0]?.count || 0
    }));

    return NextResponse.json(tribesWithCounts);

  } catch (error) {
    console.error('Error fetching tribes:', error);
    return NextResponse.json([], { status: 200 });
  }
}