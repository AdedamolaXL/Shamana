"use client";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2";
import { useEffect, useState, useCallback } from "react";
import useSound from "use-sound"

import { Song } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { Slider } from "../ui"
import usePlayer from "@/hooks/usePlayer";
import { FaList, FaRandom } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PlayerContentProps {
    song: Song;
    songUrl: string;
}

// Add this function to handle IPFS URLs
const sanitizeUrl = (url: string) => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL + '/ipfs/');
  }
  return url;
}

const PlayerContent: React.FC<PlayerContentProps> = ({song, songUrl}) => {
    const player = usePlayer();
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [queueSongs, setQueueSongs] = useState<Song[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(false);
    const [shuffleMode, setShuffleMode] = useState(false);
    const supabaseClient = useSupabaseClient();

    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

    // Define fetchQueueSongs with useCallback BEFORE the useEffect
    const fetchQueueSongs = useCallback(async (songIds: string[]) => {
        if (songIds.length === 0) {
            setQueueSongs([]);
            return;
        }

        try {
            const { data: songs, error } = await supabaseClient
                .from('songs')
                .select('*')
                .in('id', songIds)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching queue songs:', error);
                return;
            }

            const orderedSongs = songIds
                .map(id => songs?.find(song => song.id === id))
                .filter(Boolean) as Song[];

            setQueueSongs(orderedSongs);
        } catch (error) {
            console.error('Error fetching queue songs:', error);
        }
    }, [supabaseClient]);
    
    // Define loadRandomQueue with useCallback BEFORE the useEffect
    const loadRandomQueue = useCallback(async () => {
        setIsLoadingQueue(true);
        try {
            const { data: songs, error } = await supabaseClient
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching random songs:', error);
                return;
            }

            if (songs && songs.length > 0) {
                const filteredSongs = songs.filter(s => s.id !== song?.id);
                const shuffledSongs = [...filteredSongs].sort(() => Math.random() - 0.5).slice(0, 20);
                setQueueSongs(shuffledSongs);
            }
        } catch (error) {
            console.error('Error loading random queue:', error);
        } finally {
            setIsLoadingQueue(false);
        }
    }, [supabaseClient, song?.id]);

    // NOW the useEffect with all dependencies included
    useEffect(() => {
        const loadQueue = async () => {
            if (player.ids.length > 0 && player.activeId) {
                setIsLoadingQueue(true);
                try {
                    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
                    const nextSongIds = player.ids.slice(currentIndex + 1);
                    
                    // If we're in shuffle mode, create a shuffled queue from all available songs
                    if (shuffleMode && player.ids.length > 1) {
                        const shuffledIds = [...player.ids]
                            .filter(id => id !== player.activeId)
                            .sort(() => Math.random() - 0.5);
                        await fetchQueueSongs(shuffledIds);
                    } else {
                        // Normal queue: next songs in order
                        await fetchQueueSongs(nextSongIds);
                    }
                } catch (error) {
                    console.error('Error loading queue:', error);
                } finally {
                    setIsLoadingQueue(false);
                }
            } else {
                // If no specific queue, load random songs from library
                loadRandomQueue();
            }
        };

        loadQueue();
    }, [player.ids, player.activeId, shuffleMode, fetchQueueSongs, loadRandomQueue]);

    const onPlayNext = () => {
        if (player.ids.length === 0) {
            // If no specific playlist, play next from random queue
            if (queueSongs.length > 0) {
                const nextSong = queueSongs[0];
                player.setId(nextSong.id);
                // Update queue to remove the played song
                setQueueSongs(prev => prev.slice(1));
            }
            return;
        }

        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIndex + 1];

        if (!nextSong) {
            // If at end of playlist, loop to start or stop
            if (player.ids.length > 0) {
                player.setId(player.ids[0]);
            }
            return;
        }

        player.setId(nextSong);
    };

    const onPlayPrevious = () => {
        if (player.ids.length === 0) return;

        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIndex - 1];

        if (!previousSong) {
            // If at start of playlist, go to last song
            player.setId(player.ids[player.ids.length - 1]);
            return;
        }

        player.setId(previousSong);
    };

    const sanitizedUrl = sanitizeUrl(songUrl);
    
    const [play, {pause, sound}] = useSound(
        sanitizedUrl,
        {
            volume: volume,
            onplay: () => setIsPlaying(true),
            onend: () => {
                setIsPlaying(false);
                onPlayNext();
            },
            onPause: () => setIsPlaying(false),
            format: ['mp3']
        }
    );

    useEffect(() => {
        sound?.play();

        return () => {
            sound?.unload();
        };
    }, [sound]);

    const handlePlay = () => {
        if (!isPlaying) {
            play();
            setIsPlaying(true);
        } else {
            pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        if (volume === 0) setVolume(1);
        else setVolume(0);
    };

    const toggleQueue = () => {
        setShowQueue(!showQueue);
    };

    const toggleShuffle = () => {
        setShuffleMode(!shuffleMode);
    };

    const handleQueueItemClick = (songId: string) => {
        // If this song is part of the current playlist, set it as active
        if (player.ids.includes(songId)) {
            player.setId(songId);
        } else {
            // If it's from random queue, update player state
            player.setId(songId);
            player.setIds([songId, ...queueSongs.map(s => s.id).filter(id => id !== songId)]);
        }
        setShowQueue(false);
    };

    const formatDuration = (seconds: number = 0): string => {
        if (!seconds || seconds <= 0) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getQueueTitle = () => {
        if (player.ids.length > 0) {
            return shuffleMode ? "Up Next (Shuffle)" : "Up Next";
        }
        return "Recommended Next";
    };

    const getQueueDescription = () => {
        if (player.ids.length > 0) {
            return `${queueSongs.length} song${queueSongs.length !== 1 ? 's' : ''} in queue`;
        }
        return "Songs you might like";
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 h-full relative">
            <div className="flex w-full justify-start">
                <div className="flex items-center gap-x-4">
                    <MediaItem data={song}/>
                    <LikeButton songId={song.id} />
                </div>
            </div>
            
            <div className="hidden h-full md:flex justify-center items-center w-full max-w-[722px] gap-x-6">
                <AiFillStepBackward 
                    size={20} 
                    className="text-neutral-400 cursor-pointer hover:text-white transition" 
                    onClick={onPlayPrevious}
                />
                <div 
                    onClick={handlePlay} 
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer hover:scale-105 transition"
                >
                    <Icon size={20} className="text-black"/>
                </div>
                <AiFillStepForward 
                    size={20} 
                    className="text-neutral-400 cursor-pointer hover:text-white transition" 
                    onClick={onPlayNext}
                />
            </div>

            <div className="flex items-center justify-end gap-4">
                {/* Shuffle Button */}
                <button 
                    onClick={toggleShuffle}
                    className={`text-neutral-400 hover:text-white transition ${shuffleMode ? 'text-green-500' : ''}`}
                    title={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
                >
                    <FaRandom size={16} />
                </button>

                {/* Queue Button */}
                <button 
                    onClick={toggleQueue}
                    className={`text-neutral-400 hover:text-white transition ${showQueue ? 'text-white' : ''}`}
                    title="Show queue"
                >
                    <FaList size={20} />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-x-2 w-[120px]">
                    <VolumeIcon 
                        size={20} 
                        className="text-gray-400 cursor-pointer hover:text-white transition" 
                        onClick={toggleMute}
                    />
                    <Slider 
                        value={volume} 
                        onChange={(value) => setVolume(value)}
                    />
                </div>

                {/* Queue Dropdown */}
                {showQueue && (
                    <div className="absolute bottom-20 right-0 bg-neutral-800 rounded-lg shadow-2xl border border-neutral-700 w-80 max-h-96 overflow-y-auto z-50">
                        <div className="p-4 border-b border-neutral-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold">{getQueueTitle()}</h3>
                                {shuffleMode && (
                                    <span className="text-green-500 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                                        Shuffle
                                    </span>
                                )}
                            </div>
                            <p className="text-neutral-400 text-sm mt-1">
                                {getQueueDescription()}
                            </p>
                        </div>
                        
                        <div className="p-2">
                            {isLoadingQueue ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                </div>
                            ) : queueSongs.length === 0 ? (
                                <div className="text-center py-8 text-neutral-400">
                                    <p>No songs in queue</p>
                                    <p className="text-sm mt-1">Add more songs to see them here</p>
                                </div>
                            ) : (
                                queueSongs.map((queueSong, index) => (
                                    <div
                                        key={queueSong.id}
                                        onClick={() => handleQueueItemClick(queueSong.id)}
                                        className="flex items-center gap-3 p-3 rounded-md hover:bg-neutral-700/50 cursor-pointer transition group"
                                    >
                                        <div className="w-8 flex items-center justify-center">
                                            <span className="text-neutral-400 text-sm group-hover:text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {queueSong.title}
                                            </p>
                                            <p className="text-neutral-400 text-xs truncate">
                                                {queueSong.author}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {queueSong.duration && (
                                                <span className="text-neutral-400 text-xs">
                                                    {formatDuration(queueSong.duration)}
                                                </span>
                                            )}
                                            <div className="w-2 h-2 rounded-full bg-neutral-600 group-hover:bg-green-500 transition-colors"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Current Playing Indicator */}
                        <div className="p-3 border-t border-neutral-700 bg-neutral-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 flex items-center justify-center">
                                    <span className="text-green-500 text-sm">▶</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-green-400 text-sm font-medium truncate">
                                        Now Playing
                                    </p>
                                    <p className="text-white text-sm truncate">
                                        {song.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default PlayerContent;