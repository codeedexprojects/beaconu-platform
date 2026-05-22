export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm animate-pulse">
        {/* Brand placeholder */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/10" />
          <div className="h-6 w-28 rounded-lg bg-white/10" />
          <div className="h-3.5 w-36 rounded-lg bg-white/5" />
        </div>

        {/* Card skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 space-y-4 shadow-2xl">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-3 w-36 rounded bg-white/5" />
            </div>
          </div>

          {/* Form fields */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-10 w-full rounded-md bg-white/5 border border-white/10" />
            </div>
          ))}

          {/* Button */}
          <div className="h-10 w-full rounded-full bg-primary/30 mt-2" />
        </div>
      </div>
    </div>
  );
}
