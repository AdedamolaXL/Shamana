// components/PlaylistItem.tsx
"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaMusic } from "react-icons/fa"
import { Playlist } from "@/types"

interface PlaylistItemProps {
    data: Playlist;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ data }) => {
    const router = useRouter();
    
    const handleClick = () => {
        router.push(`/playlists/${data.id}`);
    }

    return (
        <div
            onClick={handleClick}
            className="relative group flex flex-col items-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
        >
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
                {data.image_path ? (
                    <Image
                        className="object-cover"
                        src={data.image_path}
                        fill
                        alt="Playlist cover"
                    />
                ) : (
                    <FaMusic className="text-neutral-400" size={32} />
                )}
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                <p className="font-semibold truncate w-full">
                    {data.name}
                </p>
                {data.description && (
                    <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                        {data.description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default PlaylistItem