export const EventsSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="flex flex-col gap-3 p-4 border border-[#333] rounded-lg">
        <div className="flex gap-3">
          <div className="flex flex-col items-center justify-center bg-gray-700 rounded-lg min-w-[50px] h-[50px] p-1.5">
            <div className="h-4 bg-gray-600 rounded w-6 mb-1"></div>
            <div className="h-3 bg-gray-600 rounded w-4"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-700 rounded-full"></div>
      </div>
    ))}
  </div>
);