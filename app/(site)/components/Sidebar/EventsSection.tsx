"use client";
import { EventsSectionProps } from "./types";
import { EventsSkeleton } from "./EventsSkeleton";

const events = [
  { day: "15", month: "Sep", title: "Indie Rock Jam Session", details: "8:00 PM • Virtual" },
  { day: "18", month: "Sep", title: "Electronic Music Workshop", details: "7:30 PM • Studio A" },
  { day: "22", month: "Sep", title: "Hip-Hop Beat Making", details: "6:00 PM • The Loft" },
  { day: "25", month: "Sep", title: "R&B Vocal Session", details: "5:00 PM • Vocal Booth" },
];

export const EventsSection: React.FC<EventsSectionProps> = ({ isLoading }) => {
  const dynamicGradients = [
    "linear-gradient(135deg, #6a11cb 0%, #2575fc 50%, #6a11cb 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%)",
    "linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)",
    "linear-gradient(135deg, #8360c3 0%, #2ebf91 50%, #8360c3 100%)",
  ];

  return (
    <div className="bg-[#111] rounded-xl p-5 
      transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold transition-colors duration-300 hover:text-white">
          Upcoming Jam Sessions
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
              // Handle view all events navigation
            }
          }}
        >
          View all
        </a>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <EventsSkeleton />
        ) : (
          events.map((event, index) => (
            <div 
              key={index} 
              className="flex flex-col gap-3 p-4 border border-[#333] rounded-lg
                transition-all duration-300 
                hover:border-purple-500/50 hover:bg-white/5 hover:shadow-lg hover:shadow-purple-500/10
                focus-within:border-purple-500/50 focus-within:bg-white/5 focus-within:shadow-lg focus-within:shadow-purple-500/10
                group"
            >
              <div className="flex gap-3">
                <div className="flex flex-col items-center justify-center bg-[#6a11cb] rounded-lg min-w-[50px] h-[50px] p-1.5
                  transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg animate-gradient"
                  style={{ background: dynamicGradients[index % dynamicGradients.length] }}>
                  <div className="text-lg font-semibold leading-none transition-transform duration-300 group-hover:scale-110">
                    {event.day}
                  </div>
                  <div className="text-[0.7rem] uppercase transition-transform duration-300 group-hover:scale-110">
                    {event.month}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1 transition-colors duration-300 group-hover:text-white">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                    {event.details}
                  </div>
                </div>
              </div>
              <button 
                className="bg-transparent border border-[#6a11cb] text-[#6a11cb] px-3 py-1.5 rounded-full text-xs font-medium 
                  transition-all duration-300 
                  hover:bg-[#6a11cb] hover:text-white hover:scale-105 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#6a11cb] focus:text-white focus:scale-105
                  active:scale-95
                  group-hover:border-purple-400 group-hover:text-purple-400 group-hover:bg-transparent"
                onClick={() => console.log(`Joining ${event.title}`)}
              >
                Coming Soon
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};