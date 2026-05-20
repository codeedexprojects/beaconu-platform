import { Loader2 } from "lucide-react";

export default function CollegePortalLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#1b1b1b] [font-family:Poppins,ui-sans-serif,system-ui] animate-pulse">
      {/* Skeleton Header Area */}
      <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 rounded-[30px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between border">
          <div className="flex items-center gap-4">
            {/* Logo box placeholder */}
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />

            <div className="space-y-2">
              {/* College name text block */}
              <div className="h-7 w-48 rounded-lg bg-slate-200" />
              {/* Estd text block */}
              <div className="h-4 w-24 rounded-lg bg-slate-100" />
            </div>
          </div>

          {/* Navigation placeholder */}
          <div className="h-10 w-80 rounded-2xl bg-slate-100" />
        </div>

        {/* Big Banner placeholder */}
        <div className="relative overflow-hidden rounded-[28px] bg-slate-200 h-[380px] sm:h-[460px] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3 bg-white/40 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="text-sm font-semibold text-slate-800 tracking-wider">
              RETRIEVING CAMPUS PORTAL...
            </span>
          </div>
        </div>

        {/* Button placeholder */}
        <div className="mt-8 flex justify-center">
          <div className="h-12 w-48 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main content grid skeletons */}
      <main className="mx-auto max-w-7xl space-y-16 px-4 pb-20 sm:px-6 lg:px-8">
        {/* Metric Cards Skeletons */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-3xl bg-white border border-slate-200/60 p-6 flex flex-col justify-center items-center space-y-2 shadow-sm">
            <div className="h-6 w-6 rounded-full bg-slate-200" />
            <div className="h-4 w-28 rounded-lg bg-slate-100" />
            <div className="h-4 w-16 rounded-lg bg-slate-200" />
          </div>
          <div className="h-28 rounded-3xl bg-white border border-slate-200/60 p-6 flex flex-col justify-center items-center space-y-2 shadow-sm">
            <div className="h-6 w-6 rounded-full bg-slate-200" />
            <div className="h-4 w-24 rounded-lg bg-slate-100" />
            <div className="h-4 w-20 rounded-lg bg-slate-200" />
          </div>
        </section>

        {/* About Section Skeleton */}
        <section className="space-y-4 text-center">
          <div className="mx-auto h-8 w-60 rounded-xl bg-slate-200" />
          <div className="mx-auto space-y-2 max-w-3xl">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-[90%] rounded bg-slate-200 mx-auto" />
            <div className="h-4 w-[75%] rounded bg-slate-200 mx-auto" />
          </div>
        </section>

        {/* Programs Grid Skeletons */}
        <section className="rounded-[34px] bg-[#fff7ef] p-6 sm:p-10 border border-[#ffd9bf]/40 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-xl bg-slate-200" />
              <div className="h-4 w-44 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-36 rounded-full bg-white border" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-[#ffd9bf] bg-white p-5 space-y-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="h-6 w-20 rounded bg-slate-100" />
                  <div className="h-4 w-12 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-full rounded bg-slate-200" />
                <div className="h-4 w-[80%] rounded bg-slate-100" />
                <div className="h-10 w-24 rounded-xl bg-slate-100 border mt-2" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
