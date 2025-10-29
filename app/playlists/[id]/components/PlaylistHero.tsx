"use client";

import { PlaylistWithSongs } from "@/types";
import { FaGem, FaCrown, FaMusic, FaClock } from "react-icons/fa";

interface PlaylistHeroProps {
  playlist: PlaylistWithSongs;
  isCreator: boolean;
  isCollected: boolean;
  isPulsing: boolean;
  collectionCount: number;
  reputationData: {
    score: number;
  };
  getCreatorName: () => string;
  onCollectClick: () => void;
  calculateDuration: () => string;
}

export const PlaylistHero: React.FC<PlaylistHeroProps> = ({
  playlist,
  isCreator,
  isCollected,
  isPulsing,
  collectionCount,
  reputationData,
  getCreatorName,
  onCollectClick,
  calculateDuration
}) => {
  return (
    <section className={`relative h-[300px] rounded-xl overflow-hidden my-10 flex items-end p-10 
      bg-gradient-to-br from-[#6a11cb] to-[#2575fc] lg:h-[250px] lg:p-8 md:h-[200px] md:my-5 md:p-5
      ${isPulsing ? 'animate-pulse-slow' : ''}`}>
      
      {/* CTA Button - Top Right */}
      {!isCreator && !isCollected && (
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={onCollectClick}
            className="group relative bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold py-3 px-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25 flex items-center gap-2 border-2 border-amber-300"
          >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
            
            <FaGem className="text-amber-700 group-hover:text-amber-800 transition-colors" />
            <span className="whitespace-nowrap">Collect as NFT</span>
            
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Own this playlist forever! 🎵
            </div>
          </button>
        </div>
      )}

      {/* Collection Badge */}
      {isCollected && (
        <div className="absolute top-6 right-6 z-20">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 border-2 border-emerald-300">
            <FaGem className="text-white" />
            <span className="whitespace-nowrap">Collected ✓</span>
          </div>
        </div>
      )}

      {/* Curator Badge */}
      {isCreator && (
        <div className="absolute top-6 right-6 z-20">
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 border-2 border-pink-300">
            <FaCrown className="text-white" />
            <span className="whitespace-nowrap">Your Creation</span>
          </div>
        </div>
      )}

      {/* Banner Content */}
      <div className="relative z-10 w-full">
        <h1 className="text-4xl font-bold mb-2 md:text-3xl">{playlist.name}</h1>
        <p className="text-lg mb-5 opacity-90 max-w-[600px] md:text-base">
          {playlist.description || `A curated playlist by ${getCreatorName()}`}
        </p>
        <div className="flex gap-5 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <FaMusic />
            <span>{playlist.playlist_songs?.length || 0} songs</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock />
            <span>{calculateDuration()}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaGem className="text-sm" />
            <span>{collectionCount} collectors</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fas fa-star"></i>
            <span className={`font-bold ${reputationData.score > 0 ? 'text-green-500' : reputationData.score < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {reputationData.score}%
            </span>
          </div>
        </div>
      </div>

      {/* Animated overlay for pulsing effect */}
      {isPulsing && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-xl"></div>
      )}
    </section>
  );
};