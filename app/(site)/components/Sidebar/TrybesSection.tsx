"use client";
import { TrybesSectionProps } from "./types";
import { TrybesSkeleton } from "./TrybesSkeleton";

const trybes = [
  "Afrobbeats",
  "Amapiano",
  "Hiplife",
  "Alte",
];

export const TrybesSection: React.FC<TrybesSectionProps> = ({ isLoading }) => {
  return (
    <div className="bg-[#111] rounded-xl p-5 
      transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold transition-colors duration-300 hover:text-white">
          Trybes for you
        </h2>
        <a 
          href="#" 
          className="text-[#6a11cb] font-medium 
            transition-all duration-300 
            hover:text-purple-400 hover:underline
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:rounded focus:px-2 focus:py-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Handle view all trybes navigation
            }
          }}
        >
          View all
        </a>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <TrybesSkeleton />
        ) : (
          trybes.map((trybe, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 border-b border-[#222] last:border-b-0
                transition-all duration-300 
                hover:bg-white/5 hover:px-3 hover:-mx-2 hover:rounded-lg
                focus-within:bg-white/5 focus-within:px-3 focus-within:-mx-2 focus-within:rounded-lg
                group"
            >
              <div className="font-medium transition-colors duration-300 group-hover:text-white">
                {trybe}
              </div>
              <button 
                className="bg-transparent border border-[#6a11cb] text-[#6a11cb] px-3 py-1.5 rounded-full text-xs font-medium 
                  transition-all duration-300 
                  hover:bg-[#6a11cb] hover:text-white hover:scale-105 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#6a11cb] focus:text-white focus:scale-105
                  active:scale-95
                  group-hover:border-purple-400 group-hover:text-purple-400 group-hover:bg-transparent"
                onClick={() => console.log(`Viewing ${trybe} tribe`)}
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};