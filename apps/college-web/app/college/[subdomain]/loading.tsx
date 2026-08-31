function Pulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-field ${className ?? ""}`} />
  );
}

function SectionSkeleton({
  titleWidth = "w-56",
  children,
}: {
  titleWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Pulse className={`h-3 ${titleWidth} max-w-full`} />
      <Pulse className="mt-3 h-8 w-72 max-w-full" />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function CardGridSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-5 ${className ?? "sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <Pulse className="h-40 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CollegeLandingLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className="relative flex min-h-[560px] flex-col items-center justify-center gap-4 bg-slate-200 px-4 py-24">
        <Pulse className="h-3 w-32 bg-slate-300" />
        <Pulse className="h-12 w-2/3 max-w-2xl bg-slate-300" />
        <Pulse className="h-4 w-64 bg-slate-300" />
        <div className="mt-4 flex gap-3">
          <Pulse className="h-11 w-40 rounded-lg bg-slate-300" />
          <Pulse className="h-11 w-40 rounded-lg bg-slate-300" />
        </div>
      </div>

      {/* Announcements ticker */}
      <div className="h-11 w-full bg-field" />

      {/* About */}
      <SectionSkeleton titleWidth="w-40">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-4 w-2/3" />
          </div>
          <Pulse className="h-64 w-full" />
        </div>
      </SectionSkeleton>

      {/* Campus stats band */}
      <div className="bg-field py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <Pulse className="mx-auto h-7 w-16 bg-white" />
              <Pulse className="mx-auto h-3 w-20 bg-white" />
            </div>
          ))}
        </div>
      </div>

      {/* Admissions CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Pulse className="h-40 w-full" />
      </section>

      {/* Courses */}
      <SectionSkeleton titleWidth="w-24">
        <div className="no-scrollbar flex gap-5 overflow-x-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-80 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <Pulse className="h-44 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* Scholarships */}
      <SectionSkeleton titleWidth="w-28">
        <div className="no-scrollbar flex gap-5 overflow-x-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-96 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <Pulse className="h-48 w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* Amenities */}
      <SectionSkeleton titleWidth="w-32">
        <CardGridSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3" />
      </SectionSkeleton>

      {/* Campus highlights */}
      <SectionSkeleton titleWidth="w-44">
        <CardGridSkeleton count={3} />
      </SectionSkeleton>

      {/* Our stories (reels) */}
      <SectionSkeleton titleWidth="w-32">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="aspect-[9/16] w-full" />
          ))}
        </div>
      </SectionSkeleton>

      {/* Achievements */}
      <SectionSkeleton titleWidth="w-40">
        <CardGridSkeleton count={3} />
      </SectionSkeleton>

      {/* Sharing experience (testimonials) */}
      <section className="bg-field/40 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Pulse className="mx-auto h-3 w-40" />
          <Pulse className="mx-auto mt-3 h-8 w-56" />
          <div className="mt-10 space-y-4 rounded-3xl bg-white p-10">
            <Pulse className="mx-auto h-4 w-full" />
            <Pulse className="mx-auto h-4 w-5/6" />
            <div className="mx-auto mt-6 flex flex-col items-center gap-2">
              <Pulse className="h-16 w-16 rounded-full" />
              <Pulse className="h-3 w-24" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <SectionSkeleton titleWidth="w-24">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:grid-rows-2">
          <Pulse className="col-span-1 row-span-2 aspect-[4/6.5] w-full sm:col-span-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="aspect-square w-full" />
          ))}
        </div>
      </SectionSkeleton>

      {/* Reviews */}
      <SectionSkeleton titleWidth="w-24">
        <CardGridSkeleton count={3} />
      </SectionSkeleton>

      {/* Ambassadors */}
      <SectionSkeleton titleWidth="w-32">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <Pulse className="mx-auto h-24 w-24 rounded-full" />
              <Pulse className="mx-auto h-3 w-20" />
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* CTA footer band */}
      <div className="bg-field py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Pulse className="mx-auto h-8 w-72" />
          <Pulse className="mx-auto mt-3 h-4 w-96 max-w-full" />
          <div className="mt-7 flex justify-center gap-3">
            <Pulse className="h-11 w-44 rounded-full" />
            <Pulse className="h-11 w-44 rounded-full" />
          </div>
        </div>
      </div>

      {/* Site footer */}
      <div className="bg-white py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
