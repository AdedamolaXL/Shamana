"use client";
import { WaveformAnimation } from "@/app/(site)/components/shared/WaveformAnimation";
import { AnimatedGradientBackground } from "@/app/(site)/components/shared/AnimationGradientBackground";
import { WaveformThumbnailProps } from "./types";

export const WaveformThumbnail: React.FC<WaveformThumbnailProps> = ({
  gradientIndex,
  isPlaying,
  songCount,
  onThumbnailClick,
  onTogglePlay,
}) => {
  return (
    <div
      className="relative h-[180px] rounded-lg mb-4 overflow-hidden 
        transition-transform duration-300 group-hover:scale-[1.02] group-focus:scale-[1.02]
        border-2 border-white/10 group-hover:border-white/20
        cursor-pointer"
      onClick={onThumbnailClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onThumbnailClick();
        }
      }}
    >
      <AnimatedGradientBackground gradientIndex={gradientIndex} />
      
      <WaveformAnimation isPlaying={isPlaying} />
      
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-white/90 w-[60px] h-[60px] rounded-full flex items-center justify-center 
          transition-all duration-300 
          hover:bg-white hover:scale-125 hover:shadow-2xl
          focus:outline-none focus:ring-4 focus:ring-white focus:scale-125
          group-hover:scale-110 group-focus:scale-110 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlay();
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onTogglePlay();
          }
        }}
      >
        {isPlaying ? (
          <i className="fas fa-pause text-black text-xl transition-transform duration-300"></i>
        ) : (
          <i className="fas fa-play text-black text-xl transition-transform duration-300 group-hover:scale-110 ml-1"></i>
        )}
      </div>

      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        {songCount} songs
      </div>
    </div>
  );
};