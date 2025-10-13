import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { artistName, songId } = await request.json();

    if (!artistName || !songId) {
      return NextResponse.json({ error: "Artist name and song ID are required" }, { status: 400 });
    }

    // First, get or create the artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('name', artistName)
      .single();

    if (artistError) {
      console.error('Error finding artist:', artistError);
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Check if the relationship already exists
    const { data: existingRelationship } = await supabase
      .from('artist_songs')
      .select('id')
      .eq('artist_id', artist.id)
      .eq('song_id', songId)
      .single();

    if (existingRelationship) {
      return NextResponse.json({ 
        success: true, 
        message: "Relationship already exists",
        alreadyExists: true 
      });
    }

    // Create the artist-song relationship
    const { error: relationshipError } = await supabase
      .from('artist_songs')
      .insert({
        artist_id: artist.id,
        song_id: songId
      });

    if (relationshipError) {
      console.error('Error creating artist-song relationship:', relationshipError);
      return NextResponse.json({ error: relationshipError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Song linked to artist successfully" 
    });

  } catch (error: any) {
    console.error('Artist-song linking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}