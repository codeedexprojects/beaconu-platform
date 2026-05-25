export default function OtpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        <div className="h-12 w-12 rounded-2xl bg-white/10 mx-auto" />
        <div className="h-6 w-32 rounded-lg bg-white/10 mx-auto" />
        <div className="rounded-2xl border border-white/10 p-8 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-16 rounded bg-white/10" />
              <div className="h-9 w-full rounded-lg bg-white/10" />
            </div>
          ))}
          <div className="h-10 w-full rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}
