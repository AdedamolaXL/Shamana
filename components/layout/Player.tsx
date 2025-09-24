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
            <div className='fixed bottom-0 bg-black w-full py-4 h-[90px] px-6 flex items-center justify-center border-t border-neutral-800'>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-800 rounded-lg animate-pulse"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-4 bg-neutral-800 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-neutral-800 rounded w-24 animate-pulse"></div>
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
        <div className='fixed bottom-0 bg-black w-full py-4 h-[90px] px-6 border-t border-neutral-800 shadow-2xl player-gradient'>
            <PlayerContent 
                song={currentSong!} 
                songUrl={currentSongUrl} 
                key={currentSongUrl} 
            />
        </div>
    );
}

export default Player;