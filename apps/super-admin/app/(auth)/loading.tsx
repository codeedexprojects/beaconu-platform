export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-muted mx-auto" />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-20 rounded bg-muted" />
              <div className="h-9 w-full rounded-lg bg-muted" />
            </div>
          ))}
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
