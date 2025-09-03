"use client"
import { Playlist } from "@/types";
import PlaylistItem from "./PlaylistItem";

// Define the correct props interface
interface PageContentProps {
    playlists: Playlist[];
}

const PageContent: React.FC<PageContentProps> = ({playlists}) => {

    if (playlists.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No playlists available
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-4 mt-4">
            {playlists.map((playlist) => (
                <PlaylistItem key={playlist.id} data={playlist} />
            ))}
        </div>
    )
}

export default PageContent;