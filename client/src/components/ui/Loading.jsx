export function Spinner({ size = 20, className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-ink-600 border-t-neon-cyan ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`card-surface animate-pulse overflow-hidden ${className}`}>
      <div className="aspect-[4/3] bg-ink-800" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 w-2/3 rounded bg-ink-800" />
        <div className="h-3 w-1/3 rounded bg-ink-800" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = "" }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
