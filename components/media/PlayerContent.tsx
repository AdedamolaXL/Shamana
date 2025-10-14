"use client";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2";
import { useEffect, useState, useCallback } from "react";
import useSound from "use-sound"
import { Song } from "@/types";
import MediaItem from "./MediaItem";
import { Slider } from "../ui"
import usePlayer from "@/hooks/usePlayer";
import { FaList, FaRandom } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PlayerContentProps {
    song: Song;
    songUrl: string;
}

const sanitizeUrl = (url: string) => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL + '/ipfs/');
  }
  
  return url;
}

const PlayerContent: React.FC<PlayerContentProps> = ({song, songUrl}) => {
    const player = usePlayer();
    const [showQueue, setShowQueue] = useState(false);
    const [queueSongs, setQueueSongs] = useState<Song[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(false);
    const [shuffleMode, setShuffleMode] = useState(false);
    const supabaseClient = useSupabaseClient();

    const Icon = player.isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = player.volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

    // Fetch songs for the queue based on context
    const fetchQueueSongs = useCallback(async (songIds: string[]) => {
        if (songIds.length === 0) {
            setQueueSongs([]);
            return;
        }

        try {
            const { data: songs, error } = await supabaseClient
                .from('songs')
                .select('*')
                .in('id', songIds);

            if (error) {
                console.error('Error fetching queue songs:', error);
                return;
            }

            // Order songs according to the songIds array
            const orderedSongs = songIds
                .map(id => songs?.find(song => song.id === id))
                .filter(Boolean) as Song[];

            setQueueSongs(orderedSongs);
        } catch (error) {
            console.error('Error fetching queue songs:', error);
        }
    }, [supabaseClient]);
    
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

    // Load queue based on player context
    useEffect(() => {
        const loadQueue = async () => {
            // If we have a playlist context and IDs, show those songs
            if (player.ids.length > 0 && player.activeId) {
                setIsLoadingQueue(true);
                try {
                    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
                    const nextSongIds = player.ids.slice(currentIndex + 1);
                    
                    if (shuffleMode && player.ids.length > 1) {
                        const shuffledIds = [...player.ids]
                            .filter(id => id !== player.activeId)
                            .sort(() => Math.random() - 0.5);
                        await fetchQueueSongs(shuffledIds);
                    } else {
                        await fetchQueueSongs(nextSongIds);
                    }
                } catch (error) {
                    console.error('Error loading queue:', error);
                } finally {
                    setIsLoadingQueue(false);
                }
            } else {
                // No playlist context, load random songs
                loadRandomQueue();
            }
        };

        loadQueue();
    }, [player.ids, player.activeId, shuffleMode, fetchQueueSongs, loadRandomQueue]);

    const onPlayNext = () => {
        if (player.ids.length === 0) {
            if (queueSongs.length > 0) {
                const nextSong = queueSongs[0];
                player.setId(nextSong.id);
                setQueueSongs(prev => prev.slice(1));
            }
            return;
        }

        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIndex + 1];

        if (!nextSong) {
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
            player.setId(player.ids[player.ids.length - 1]);
            return;
        }

        player.setId(previousSong);
    };

    const sanitizedUrl = sanitizeUrl(songUrl);
    
    const [play, {pause, sound}] = useSound(
        sanitizedUrl,
        {
            volume: player.volume,
            html5: true,
            format: ['mp3', 'wav', 'ogg'],
            onplay: () => player.setIsPlaying(true),
            onend: () => {
                player.setIsPlaying(false);
                onPlayNext();
            },
            onpause: () => player.setIsPlaying(false),
            onload: () => {
                console.log('Audio loaded successfully');
            },
            onloaderror: (id: any, error: any) => {
                console.error('Audio load error:', error, 'URL:', sanitizedUrl);
            },
            onplayerror: (id: any, error: any) => {
                console.error('Audio play error:', error);
            }
        }
    );

    useEffect(() => {
        if (sound) {
            if (player.isPlaying) {
                sound.play();
            } else {
                sound.pause();
            }
        }
    }, [player.isPlaying, sound]);

    useEffect(() => {
        return () => {
            sound?.unload();
        };
    }, [sound]);

    const handlePlay = () => {
        player.setIsPlaying(!player.isPlaying);
    };

    const toggleMute = () => {
        if (player.volume === 0) {
            player.setVolume(1);
        } else {
            player.setVolume(0);
        }
    };

    const toggleQueue = () => {
        setShowQueue(!showQueue);
    };

    const toggleShuffle = () => {
        setShuffleMode(!shuffleMode);
    };

    const handleQueueItemClick = (songId: string) => {
        player.setId(songId);
        setShowQueue(false);
    };

    const formatDuration = (seconds: number = 0): string => {
        if (!seconds || seconds <= 0) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getQueueTitle = () => {
        if (player.playlistContext) {
            return shuffleMode ? "Playlist Queue (Shuffle)" : "Playlist Queue";
        }
        if (player.ids.length > 0) {
            return shuffleMode ? "Up Next (Shuffle)" : "Up Next";
        }
        return "Recommended Next";
    };

    const getQueueDescription = () => {
        if (player.playlistContext) {
            return `${queueSongs.length} song${queueSongs.length !== 1 ? 's' : ''} in playlist`;
        }
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
                </div>
            </div>
            
            <div className="hidden h-full md:flex justify-center items-center w-full max-w-[722px] gap-x-8">
                <button 
                    onClick={onPlayPrevious}
                    className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-all duration-200 group"
                >
                    <AiFillStepBackward 
                        size={22} 
                        className="text-neutral-300 group-hover:text-white transition-colors" 
                    />
                </button>
                
                <button 
                    onClick={handlePlay} 
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <Icon size={24} className="text-black"/>
                </button>
                
                <button 
                    onClick={onPlayNext}
                    className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-all duration-200 group"
                >
                    <AiFillStepForward 
                        size={22} 
                        className="text-neutral-300 group-hover:text-white transition-colors" 
                    />
                </button>
            </div>

            <div className="flex items-center justify-end gap-6 pr-4">
                <button 
                    onClick={toggleShuffle}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                        shuffleMode 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                    title={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
                >
                    <FaRandom size={16} />
                </button>

                <button 
                    onClick={toggleQueue}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                        showQueue 
                            ? 'bg-white/10 text-white' 
                            : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                    title="Show queue"
                >
                    <FaList size={18} />
                </button>

                <div className="flex items-center gap-x-3 w-[140px]">
                    <button 
                        onClick={toggleMute}
                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all duration-200"
                    >
                        <VolumeIcon size={20} />
                    </button>
                    <Slider 
                        value={player.volume} 
                        onChange={(value) => player.setVolume(value)}
                    />
                </div>

                {showQueue && (
                    <div className="absolute bottom-24 right-4 bg-neutral-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-neutral-700 w-96 max-h-80 overflow-y-auto z-50">
                        <div className="p-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg">{getQueueTitle()}</h3>
                                {shuffleMode && (
                                    <span className="text-green-400 text-xs bg-green-500/20 px-3 py-1 rounded-full font-medium">
                                        Shuffle Active
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