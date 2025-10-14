import usePlayer from "./usePlayer";
import { Song } from "@/types";

const useOnPlay = (songs: Song[]) => {
    const player = usePlayer();

    const onPlay = (id: string) => {
        player.setId(id);
        if (songs && songs.length > 0) {
            player.setIds(songs.map((song) => song.id));
        }
        player.setIsPlaying(true);
    }

    return onPlay;
}

export default useOnPlay;