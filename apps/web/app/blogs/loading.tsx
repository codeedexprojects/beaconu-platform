function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-navy-dark/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="h-44 w-full animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-2 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-auto flex items-center justify-between border-t border-navy-dark/5 pt-3">
          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function BlogsLoading() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between border-b border-navy-dark/[0.06] bg-cream/85 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 animate-pulse rounded-[10px] bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-6 pt-28 md:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-9 w-56 animate-pulse rounded bg-muted" />
        </div>

        <div className="mb-8 flex gap-2.5">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
