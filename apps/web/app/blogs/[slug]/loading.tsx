export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between border-b border-navy-dark/[0.06] bg-cream/85 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 animate-pulse rounded-[10px] bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 md:px-6">
        <div className="mb-6 h-4 w-20 animate-pulse rounded bg-muted" />

        <div className="h-64 w-full animate-pulse rounded-2xl bg-muted md:h-80" />

        <div className="pt-7">
          <div className="mb-4 flex gap-1.5">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>

          <div className="mb-3 space-y-2">
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          </div>

          <div className="mb-5 space-y-2 border-l-2 border-muted pl-4">
            <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
          </div>

          <div className="mb-7 flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="mb-7 border-t border-navy-dark/5" />

          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
