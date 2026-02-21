export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded-md animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  );
}
