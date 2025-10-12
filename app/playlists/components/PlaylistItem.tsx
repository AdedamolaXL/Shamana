"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaMusic, FaPlay } from "react-icons/fa"
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
            className="relative group flex flex-col items-center rounded-lg overflow-hidden gap-x-4 bg-neutral-800/40 cursor-pointer hover:bg-neutral-700/50 transition-all duration-300 p-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
            <div className="relative aspect-square w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-neutral-800 flex items-center justify-center shadow-inner">
                {data.image_path ? (
                    <Image
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        src={data.image_path}
                        fill
                        alt="Playlist cover"
                    />
                ) : (
                    <FaMusic className="text-neutral-400" size={32} />
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-green-500 p-3 rounded-full shadow-lg">
                        <FaPlay className="text-black ml-0.5" size={16} />
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                <p className="font-semibold text-white truncate w-full text-base">
                    {data.name}
                </p>
                {data.description && (
                    <p className="text-neutral-400 text-sm w-full truncate leading-tight mt-1">
                        {data.description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default PlaylistItem