import { NextRequest, NextResponse } from 'next/server';
import { reputationSystem } from '@/lib/hedera-reputation';

interface Context {
  params: {
    playlistId: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const { playlistId } = context.params;

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    const reputation = await reputationSystem.calculatePlaylistReputation(playlistId);
    const messages = await reputationSystem.getPlaylistReputation(playlistId);

    return NextResponse.json({
      reputation,
      messages: messages.slice(0, 50) // Return most recent 50 messages
    });
  } catch (error) {
    console.error('Error retrieving playlist reputation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve playlist reputation' },
      { status: 500 }
    );
  }
}