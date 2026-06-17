export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full h-56 p-2">
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-2 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}