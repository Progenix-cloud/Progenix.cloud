export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded-md animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  );
}
