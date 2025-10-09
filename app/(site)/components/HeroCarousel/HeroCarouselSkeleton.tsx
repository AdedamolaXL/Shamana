export const HeroCarouselSkeleton = () => (
  <div className="relative my-10 rounded-xl overflow-hidden h-[400px] bg-gray-800 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 bg-gray-700 rounded w-64 mb-4 mx-auto"></div>
        <div className="h-4 bg-gray-700 rounded w-96 mb-6 mx-auto"></div>
        <div className="h-12 bg-gray-700 rounded-full w-48 mx-auto"></div>
      </div>
    </div>
  </div>
);