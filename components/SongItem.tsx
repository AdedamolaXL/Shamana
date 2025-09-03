"use client"

import Image from "next/image"
import { useState } from "react"
import useLoadImage from '@/hooks/useLoadImage'
import { Song } from "@/types"
import PlayButton from "./PlayButton"
import { FaMusic } from "react-icons/fa"
import AddToPlaylistButton from "./AddToPlaylistButton"

interface SongItemProps {
    data: Song;
    onClick: (id: string) => void
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = useLoadImage(data);
    
   return (
        <div className="relative group flex flex-col items-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3">
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
                {imageError || !imageUrl ? (
                    <FaMusic className="text-neutral-400" size={32} />
                ) : (
                    <Image  
                        className="object-cover" 
                        src={imageUrl}
                        fill
                        alt="Song Cover"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                <p className="font-semibold truncate w-full">
                    {data.title}
                </p>
                <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                    By {data.author}
                </p>
            </div>
            <div className="absolute bottom-24 right-5">
                <PlayButton />
            </div>
            <div className="absolute top-3 right-3">
                <AddToPlaylistButton songId={data.id} />
            </div>
        </div>
    )
}


export default SongItem