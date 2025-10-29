import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface Context {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: Context) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: artistId } = context.params;

    if (!artistId) {
      return NextResponse.json({ error: "Artist ID is required" }, { status: 400 });
    }

    // First, let's check if the artist exists
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, name')
      .eq('id', artistId)
      .single();

    if (artistError || !artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Get artist's songs with their basic info
    const { data: artistSongs, error: songsError } = await supabase
      .from('artist_songs')
      .select(`
        song_id,
        songs (
          id,
          title,
          duration
        )
      `)
      .eq('artist_id', artistId);

    if (songsError) {
      console.error('Error fetching artist songs:', songsError);
      return NextResponse.json({ error: "Failed to fetch artist songs" }, { status: 500 });
    }

    // Get playlist songs that contain this artist's songs
    const songIds = artistSongs?.map(item => item.song_id).filter(Boolean) || [];
    
    let totalPlays = 0;
    let totalEarnings = 0;

    if (songIds.length > 0) {
      // Get plays from song_plays table if it exists, otherwise use a fallback
      try {
        const { data: songPlays, error: playsError } = await supabase
          .from('song_plays')
          .select('song_id')
          .in('song_id', songIds);

        if (!playsError) {
          totalPlays = songPlays?.length || 0;
        } else {
          // If song_plays table doesn't exist, use artist's current plays as fallback
          console.log('song_plays table not found, using current artist plays');
          const { data: currentArtist } = await supabase
            .from('artists')
            .select('total_plays')
            .eq('id', artistId)
            .single();
          
          totalPlays = currentArtist?.total_plays || 0;
        }
      } catch (error) {
        console.log('Error fetching song plays, using fallback:', error);
        // Fallback to current artist plays
        const { data: currentArtist } = await supabase
          .from('artists')
          .select('total_plays')
          .eq('id', artistId)
          .single();
        
        totalPlays = currentArtist?.total_plays || 0;
      }

      // Calculate earnings from artist_earnings table
      const { data: artistEarnings, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('amount')
        .eq('artist_id', artistId);

      if (!earningsError && artistEarnings) {
        totalEarnings = artistEarnings.reduce((sum, earning) => sum + parseFloat(earning.amount.toString()), 0);
      } else {
        // Fallback: calculate from playlist earnings that contain this artist's songs
        const { data: playlistEarnings, error: playlistEarningsError } = await supabase
          .from('playlist_earnings')
          .select(`
            total_claimed,
            playlist_id,
            playlists (
              playlist_songs (
                song_id
              )
            )
          `)
          .in('playlist_id', 
            await supabase
              .from('playlist_songs')
              .select('playlist_id')
              .in('song_id', songIds)
              .then(({ data }) => data?.map(ps => ps.playlist_id) || [])
          );

        if (!playlistEarningsError && playlistEarnings) {
          // Artist gets 50% of playlist earnings where their songs are featured
          playlistEarnings.forEach(earning => {
            totalEarnings += (parseFloat(earning.total_claimed?.toString()) || 0) * 0.5;
          });
        }
      }
    }

    // Update artist stats in database
    const { error: updateError } = await supabase
      .from('artists')
      .update({
        total_plays: totalPlays,
        total_earnings: totalEarnings,
        last_updated_stats: new Date().toISOString()
      })
      .eq('id', artistId);

    if (updateError) {
      console.error('Error updating artist stats:', updateError);
      return NextResponse.json({ error: "Failed to update artist statistics" }, { status: 500 });
    }

    return NextResponse.json({
      artist: {
        id: artistId,
        name: artist.name
      },
      totalPlays,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      songsCount: artistSongs?.length || 0
    });

  } catch (error: any) {
    console.error('Error fetching artist stats:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch artist statistics" },
      { status: 500 }
    );
  }
}