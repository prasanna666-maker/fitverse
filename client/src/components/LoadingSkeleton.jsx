export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-navy-900/60 border border-white/5"
        >
          <div className="h-48 animate-shimmer" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 rounded animate-shimmer" />
            <div className="h-4 w-1/2 rounded animate-shimmer" />
            <div className="h-4 w-1/3 rounded animate-shimmer" />
            <div className="flex justify-between pt-3 border-t border-white/5">
              <div className="h-6 w-20 rounded animate-shimmer" />
              <div className="h-6 w-16 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
