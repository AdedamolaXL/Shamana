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
    
    // Generate consistent gradient based on playlist ID or name
    const getGradientForPlaylist = (playlist: Playlist) => {
        const seed = playlist.id || playlist.name;
        const gradients = [
            'from-purple-500/30 to-pink-500/30',
            'from-blue-500/30 to-cyan-500/30',
            'from-green-500/30 to-emerald-500/30',
            'from-yellow-500/30 to-orange-500/30',
            'from-red-500/30 to-rose-500/30',
            'from-indigo-500/30 to-violet-500/30',
            'from-teal-500/30 to-blue-500/30',
            'from-amber-500/30 to-yellow-500/30',
            'from-fuchsia-500/30 to-purple-500/30',
            'from-sky-500/30 to-blue-500/30',
            'from-lime-500/30 to-green-500/30',
            'from-rose-500/30 to-pink-500/30'
        ];

        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        
        return gradients[index];
    };

    const gradientClass = getGradientForPlaylist(data);
    
    const handleClick = () => {
        router.push(`/playlists/${data.id}`);
    }

    return (
        <div
            onClick={handleClick}
            className="relative group flex flex-col items-center rounded-lg overflow-hidden gap-x-4 cursor-pointer hover:bg-neutral-700/50 transition-all duration-300 p-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
            <div className={`relative aspect-square w-full h-full rounded-lg overflow-hidden bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-inner`}>
                {data.image_path ? (
                    <Image
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        src={data.image_path}
                        fill
                        alt="Playlist cover"
                    />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass.replace('/30', '')} opacity-70`} />
                        
                        {/* Music icon */}
                        <FaMusic className="text-white relative z-10" size={32} />
                        
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white p-3 rounded-full shadow-lg">
                        <FaPlay className="text-black ml-0.5" size={16} />
                    </div>
                </div>
                
                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/30 transition-colors duration-300" />
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