const guides = [
  {
    id: 1,
    title: "Why Choose BeaconU?",
    bg: "#DBEAFE",
    accent: "#93C5FD",
    playColor: "#3B82F6",
  },
  {
    id: 2,
    title: "Admission Process",
    bg: "#FEF3C7",
    accent: "#FCD34D",
    playColor: "#D97706",
  },
  {
    id: 3,
    title: "Career Support",
    bg: "#D1FAE5",
    accent: "#6EE7B7",
    playColor: "#10B981",
  },
];

export function StarterGuide() {
  return (
    <section className="pt-5">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4 px-4">
        <span className="text-yellow-400 text-base" aria-hidden>
          ★
        </span>
        <h2 className="text-[12px] font-bold text-orange-500 tracking-[0.18em] uppercase">
          Your Starter Guide
        </h2>
        <span className="text-yellow-400 text-base" aria-hidden>
          ★
        </span>
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-3 px-4 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {guides.map((guide) => (
          <button
            key={guide.id}
            className="flex-shrink-0 rounded-2xl overflow-hidden relative flex flex-col justify-end"
            style={{ width: 150, height: 178, backgroundColor: guide.bg }}
          >
            {/* Decorative circle in background */}
            <div
              className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-50"
              style={{ backgroundColor: guide.accent }}
            />
            <div
              className="absolute top-12 left-6 w-10 h-10 rounded-full opacity-30"
              style={{ backgroundColor: guide.accent }}
            />

            {/* Play button centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={guide.playColor}
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </div>
            </div>

            {/* Title at bottom */}
            <div className="relative p-3">
              <p className="text-[#1A1A1A] text-[13px] font-semibold leading-tight text-left">
                {guide.title}
              </p>
            </div>
          </button>
        ))}
        {/* Trailing space */}
        <div className="w-2 flex-shrink-0" />
      </div>
    </section>
  );
}
