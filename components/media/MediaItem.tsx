"use client"
import Image from "next/image"
import { useState } from "react"
import useLoadImage from "@/hooks/useLoadImage"
import { Song } from "@/types"
import { FaMusic } from "react-icons/fa"

interface MediaItemProps {
    data: Song;
    onClick?: (id: string) => void;
    showDuration?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick, showDuration = false }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = useLoadImage(data);
    
    const handleClick = () => {
        if (onClick) return onClick(data.id);
    }

     const formatDuration = (seconds: number = 0): string => {
    if (!seconds || seconds <= 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

    return (
        <div onClick={handleClick} className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md">
            <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden bg-neutral-800 flex items-center justify-center">
                {imageError || !imageUrl ? (
                    <FaMusic className="text-neutral-400" size={24} />
                ) : (
                    <Image 
                        fill
                        src={imageUrl}
                        alt="Media item cover"
                        className="object-cover"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>
            <div className="flex flex-col gap-y-1 overflow-hidden">
                <p className="text-white truncate">
                    {data.title}
                </p>
                <p className="text-neutral-400 text-sm truncate">
                    {data.author}
                </p>
            </div>
            {showDuration && data.duration && (
                <span className="text-neutral-400 text-sm whitespace-nowrap">
                    {formatDuration(data.duration)}
                </span>
            )}
            
        </div>
    )
}

export default MediaItem