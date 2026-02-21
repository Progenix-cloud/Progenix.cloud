export default function Loading() {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-muted animate-pulse" />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-muted animate-pulse" />
        <div className="flex-1 p-8 space-y-4">
          <div className="h-10 bg-muted rounded-md animate-pulse w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
