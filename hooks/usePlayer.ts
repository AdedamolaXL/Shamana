import { create } from "zustand";

interface PlayerStore {
    ids: string[];
    activeId?: string;
    isPlaying: boolean;
    volume: number;
    duration: number;
    currentTime: number;
    playlistContext?: string; 
    setId: (id: string) => void;
    setIds: (ids: string[]) => void;
    setIsPlaying: (playing: boolean) => void;
    setVolume: (volume: number) => void;
    setDuration: (duration: number) => void;
    setCurrentTime: (currentTime: number) => void;
    setPlaylistContext: (playlistId?: string) => void; 
    reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
    ids: [],
    activeId: undefined,
    isPlaying: false,
    volume: 1,
    duration: 0,
    currentTime: 0,
    playlistContext: undefined,
    setId: (id: string) => set({ activeId: id }),
    setIds: (ids: string[]) => set({ ids: ids }),
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setVolume: (volume: number) => set({ volume }),
    setDuration: (duration: number) => set({ duration }),
    setCurrentTime: (currentTime: number) => set({ currentTime }),
    setPlaylistContext: (playlistId?: string) => set({ playlistContext: playlistId }),
    reset: () => set({ 
        ids: [], 
        activeId: undefined, 
        isPlaying: false,
        volume: 1,
        duration: 0,
        currentTime: 0,
        playlistContext: undefined
    })
}));

export default usePlayer;