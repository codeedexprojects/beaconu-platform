export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[140px] animate-pulse" />
      </div>

      <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-4 border-[#f97316] border-t-transparent" />
    </div>
  );
}
