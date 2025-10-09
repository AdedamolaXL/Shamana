interface WaveformAnimationProps {
  isPlaying?: boolean;
  color?: string;
}

export const WaveformAnimation: React.FC<WaveformAnimationProps> = ({ 
  isPlaying = false, 
  color = "#6a11cb" 
}) => {
  const bars = Array.from({ length: 60 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 flex items-end justify-between px-3 py-4">
      {bars.map((_, index) => (
        <div
          key={index}
          className="w-1 bg-white/40 rounded-t-sm transition-all duration-300 ease-in-out"
          style={{
            height: `${Math.random() * 80 + 5}%`,
            animation: isPlaying 
              ? `waveform ${0.3 + Math.random() * 0.5}s ease-in-out infinite ${index * 0.03}s alternate`
              : 'none',
            opacity: 0.5 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
};