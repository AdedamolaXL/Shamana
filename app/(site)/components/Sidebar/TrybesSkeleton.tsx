export const TrybesSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="flex justify-between items-center py-3 border-b border-[#222] last:border-b-0">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
      </div>
    ))}
  </div>
);