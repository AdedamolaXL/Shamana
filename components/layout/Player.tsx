"use client";
import { useEffect, useState } from 'react';
import useGetSongsById from '@/hooks/useGetSongById';
import usePlayer from '@/hooks/usePlayer';
import useLoadSongUrl from '@/hooks/useLoadSongUrl';
import { PlayerContent } from '../media';
import { Song } from '@/types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Player = () => {
    const player = usePlayer();
    const { song: activeSong } = useGetSongsById(player.activeId);
    const songUrl = useLoadSongUrl(activeSong!);
    const supabase = useSupabaseClient();
    const [randomSong, setRandomSong] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch a random song when no active song is playing
    useEffect(() => {
        const fetchRandomSong = async () => {
            if (activeSong) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // Get a random song from the database
                const { data: songs, error } = await supabase
                    .from('songs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) {
                    console.error('Error fetching songs:', error);
                    return;
                }

                if (songs && songs.length > 0) {
                    const randomIndex = Math.floor(Math.random() * songs.length);
                    setRandomSong(songs[randomIndex] as Song);
                    
                    player.setId(songs[randomIndex].id);
                    player.setIds(songs.map(song => song.id));
                }
            } catch (error) {
                console.error('Error fetching random song:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomSong();
    }, [activeSong, supabase, player]);

    if (isLoading) {
  return (
    <div className='fixed bottom-0 bg-gradient-to-r from-black to-neutral-900 w-full py-4 h-[90px] px-6 flex items-center justify-center border-t border-neutral-700 shadow-xl'>
      <div className="flex items-center gap-4 w-full max-w-4xl">
        <div className="w-14 h-14 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-lg animate-pulse shadow-md"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-neutral-700 rounded w-40 animate-pulse"></div>
          <div className="h-3 bg-neutral-700 rounded w-28 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-neutral-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

    if (!activeSong && !randomSong) {
        return null;
    }

    const currentSong = activeSong || randomSong;
    const currentSongUrl = songUrl || '';

    return (
            <div className='fixed bottom-0 bg-gradient-to-t from-neutral-900 to-neutral-800 w-full py-4 h-[90px] px-6 border-t border-neutral-700 shadow-2xl z-50'>
    <PlayerContent 
      song={currentSong!} 
      songUrl={currentSongUrl} 
      key={currentSongUrl} 
    />
  </div>

    );
}

export default Player;