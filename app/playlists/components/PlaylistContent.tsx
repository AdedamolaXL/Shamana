"use client";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { Song } from "@/types"
import { useUser } from "@/hooks/useUser";
import MediaItem from "@/components/media/MediaItem";
import LikeButton from "@/components/media/LikeButton"
import useOnPlay from "@/hooks/useOnPlay";

interface PlaylistContentProps {
    songs: Song[];
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({songs}) => {
    const onPlay = useOnPlay(songs);
    const router = useRouter();
    const { isLoading, user } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/');
        }
    }, [isLoading, user, router])

    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
                <p className="text-center py-8">This playlist is empty</p>
                <p className="text-center text-sm">
                    Be the first to add songs by clicking the Collaborate button!
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-2 w-full">
            {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-x-4 w-full p-3 hover:bg-neutral-700/50 rounded-md">
                    <div className="flex-1">
                        <MediaItem
                            onClick={(id: string) => {onPlay(id)}}
                            data={song}
                        />
                    </div>
                    <LikeButton songId={song.id} />
                </div>
            ))}
        </div>
    );
}
 
export default PlaylistContent;