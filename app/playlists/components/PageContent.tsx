"use client"
import { Playlist } from "@/types";
import PlaylistItem from "./PlaylistItem";
import { FaMusic } from "react-icons/fa";

interface PageContentProps {
    playlists: Playlist[];
}

const PageContent: React.FC<PageContentProps> = ({ playlists }) => {

    if (playlists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <div className="bg-neutral-800/50 rounded-full p-6 mb-4">
                    <FaMusic size={48} className="text-neutral-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
                <p className="text-neutral-500 text-center max-w-md">
                    Create your first playlist to get started. Your playlists will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
            {playlists.map((playlist) => (
                <PlaylistItem key={playlist.id} data={playlist} />
            ))}
        </div>
    )
}

export default PageContent;