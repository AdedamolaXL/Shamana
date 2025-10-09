export const ActivitySkeleton = () => (
  <div className="bg-[#1a1a1a] rounded-xl p-5 mb-5 animate-pulse">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-700"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-[180px] bg-gray-700 rounded-lg mb-4"></div>
    <div className="mb-4">
      <div className="h-5 bg-gray-700 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
    <div className="flex flex-col gap-1.5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-2.5">
          <div className="w-5 h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded flex-1"></div>
        </div>
      ))}
    </div>
  </div>
);