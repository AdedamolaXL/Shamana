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
                    .limit(50); // Get recent songs for better variety

                if (error) {
                    console.error('Error fetching songs:', error);
                    return;
                }

                if (songs && songs.length > 0) {
                    // Select a random song
                    const randomIndex = Math.floor(Math.random() * songs.length);
                    setRandomSong(songs[randomIndex] as Song);
                    
                    // Set this as the active song in the player
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

    // Don't show player if no songs are available
    if (isLoading) {
        return (
            <div className='fixed bottom-0 bg-black w-full py-2 h-[80px] px-4 flex items-center justify-center'>
                <div className="text-neutral-400 text-sm">Loading player...</div>
            </div>
        );
    }

    if (!activeSong && !randomSong) {
        return null; // No songs available at all
    }

    const currentSong = activeSong || randomSong;
    const currentSongUrl = songUrl || '';

    return (
        <div className='fixed bottom-0 bg-black w-full py-2 h-[80px] px-4'>
            <PlayerContent 
                song={currentSong!} 
                songUrl={currentSongUrl} 
                key={currentSongUrl} 
            />
        </div>
    );
}

export default Player;