import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { name, image_path } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    // Check if artist already exists
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('name', name)
      .single();

    if (existingArtist) {
      // Artist exists, update the updated_at timestamp
      await supabase
        .from('artists')
        .update({ 
          updated_at: new Date().toISOString(),
          // Update image_path if a new one is provided
          ...(image_path && { image_path })
        })
        .eq('id', existingArtist.id);

      return NextResponse.json({ 
        artist: { ...existingArtist, image_path }, 
        created: false 
      });
    }

    // Create new artist - store just the path
    const { data: newArtist, error } = await supabase
      .from('artists')
      .insert({
        name,
        image_path, // Store just the path, not full URL
        bio: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating artist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      artist: newArtist, 
      created: true 
    });

  } catch (error: any) {
    console.error('Artist creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}