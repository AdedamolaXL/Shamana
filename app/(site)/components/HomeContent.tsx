"use client"
import { Song, Playlist } from "@/types";
import { MediaItem } from "@/components";
import PlaylistItem from "@/app/playlists/components/PlaylistItem";
import useOnPlay from "@/hooks/useOnPlay";

interface HomeContentProps {
    songs?: Song[];
    playlists?: Playlist[];
}

const HomeContent: React.FC<HomeContentProps> = ({ songs, playlists }) => {
    const onPlay = useOnPlay(songs || []);

    if (songs && songs.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No Songs available
            </div>
        )
    }

    if (playlists && playlists.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No playlists available. Create your first playlist!
            </div>
        )
    }

    // Render playlists if provided, otherwise render songs
    if (playlists) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-4 mt-4">
                {playlists.map((playlist) => (
                    <PlaylistItem key={playlist.id} data={playlist} />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cs-8 gap-4 mt-4">
            {songs?.map((item) => (
                <MediaItem key={item.id} data={item}  onClick={(id: string) => {onPlay(id)}}/>
            ))}
        </div>
    )
}

export default HomeContent;