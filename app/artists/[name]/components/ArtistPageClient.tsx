"use client";
import { Artist, Song } from "@/types";
import { FaMusic, FaPlay, FaUser, FaHeadphones, FaCoins, FaChartLine } from "react-icons/fa";
import useOnPlay from "@/hooks/useOnPlay";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useLoadArtistImage from "@/hooks/useLoadArtistImage";
import { useEffect, useState } from "react";

interface ArtistPageClientProps {
  artist: Artist;
}

const ArtistPageClient: React.FC<ArtistPageClientProps> = ({ artist }) => {
  const router = useRouter();
  const onPlay = useOnPlay(artist.songs || []);
  const imageUrl = useLoadArtistImage(artist);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh artist stats
  const refreshStats = async () => {
    if (!artist.id) return;
    
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/artists/${artist.id}/refresh-stats`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Reload the page to get updated data
        router.refresh();
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePlay = (songId: string) => {
    onPlay(songId);
  };

  const handleSongClick = (songId: string) => {
    router.push(`/song/${songId}`);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num?.toLocaleString() || '0';
  };

  // Format earnings as MANA tokens
  const formatEarnings = (earnings: number): string => {
    return earnings?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[15px] py-8">
      {/* Artist Header */}
      <section className="flex gap-8 items-end mb-10">
        <div className="relative w-48 h-48 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center shadow-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={artist.name}
              fill
              className="object-cover"
            />
          ) : (
            <FaUser size={64} className="text-neutral-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-2">Artist</p>
              <h1 className="text-6xl font-bold mb-4">{artist.name}</h1>
            </div>
            <button
              onClick={refreshStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <FaChartLine className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Updating..." : "Refresh Stats"}
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-neutral-400">
            {/* Total Songs */}
            <div className="flex items-center gap-2">
              <FaMusic className="text-neutral-400" />
              <span>{artist.total_songs || 0} songs</span>
            </div>
            
            {/* Total Plays - Now from database */}
            <div className="flex items-center gap-2">
              <FaHeadphones className="text-blue-400" />
              <span className="text-white font-medium">
                {formatNumber(artist.total_plays || 0)} plays
              </span>
            </div>
            
            {/* Total Earnings - Now from database */}
            <div className="flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {formatEarnings(artist.total_earnings || 0)} MANA
              </span>
            </div>
          </div>

          {/* Earnings Note */}
          <div className="mt-4 text-sm text-neutral-500">
            Earnings from playlist contributions (50% share)
          </div>

          {/* Artist Bio */}
          {artist.bio && (
            <div className="mt-6 max-w-2xl">
              <p className="text-neutral-300 leading-relaxed">{artist.bio}</p>
            </div>
          )}
        </div>
      </section>

      

      {/* Rest of the component remains the same */}
      {/* Songs Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Songs</h2>
          {artist.songs && artist.songs.length > 0 && (
            <button 
              onClick={() => handlePlay(artist.songs![0].id)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
            >
              <FaPlay />
              Play All
            </button>
          )}
        </div>

        {artist.songs && artist.songs.length > 0 ? (
          <div className="bg-neutral-900 rounded-lg overflow-hidden">
            {artist.songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 hover:bg-neutral-800 transition-colors cursor-pointer group"
                onClick={() => handleSongClick(song.id)}
              >
                <div className="w-8 flex items-center justify-center">
                  <span className="text-neutral-400 text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(song.id);
                    }}
                    className="hidden group-hover:flex items-center justify-center text-green-500 hover:text-green-400"
                  >
                    <FaPlay size={12} />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-white">{song.title}</h3>
                </div>
                
                <div className="text-neutral-400 text-sm">
                  {song.duration ? formatDuration(song.duration) : '0:00'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <FaMusic size={48} className="mx-auto mb-4 opacity-50" />
            <p>No songs available for this artist yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default ArtistPageClient;