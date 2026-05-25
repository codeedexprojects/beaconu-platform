const testimonials = [
  {
    id: 1,
    name: "Sharuk",
    description: "got offers from crist university",
    bg: "linear-gradient(160deg, #374151 0%, #1F2937 100%)",
    avatarColor: "#6B7280",
  },
  {
    id: 2,
    name: "Priya S.",
    description: "admitted to IIT Delhi",
    bg: "linear-gradient(160deg, #1E3A5F 0%, #1E40AF 100%)",
    avatarColor: "#3B82F6",
  },
  {
    id: 3,
    name: "Rahul K.",
    description: "scholarship at VIT Vellore",
    bg: "linear-gradient(160deg, #134E4A 0%, #0D9488 100%)",
    avatarColor: "#14B8A6",
  },
];

export function VideoTestimonials() {
  return (
    <section className="px-4 md:px-6 lg:px-8">
      <h2 className="text-[17px] sm:text-xl font-bold text-[#111827] mb-3">
        Video Testimonial&apos;s
      </h2>

      {/* Mobile: horizontal scroll | sm+: 3-col grid */}
      <div
        className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {testimonials.map((t) => (
          <button
            key={t.id}
            className="flex-shrink-0 w-[205px] h-[178px] sm:w-auto sm:h-[220px] lg:h-[260px] rounded-2xl overflow-hidden relative"
            style={{ background: t.bg }}
          >
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Accent dots */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400/70" />
            <div className="absolute top-3 right-7 w-2 h-2 rounded-full bg-white/30" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/25 border border-white/40 flex items-center justify-center backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </div>
            </div>

            {/* User info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30"
                style={{ backgroundColor: t.avatarColor }}
              >
                <span className="text-white text-[11px] font-bold">
                  {t.name[0]}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-white text-[12px] font-bold leading-tight">
                  {t.name},
                </p>
                <p className="text-gray-300 text-[11px] leading-tight truncate">
                  {t.description}
                </p>
              </div>
            </div>
          </button>
        ))}
        <div className="w-2 flex-shrink-0 sm:hidden" />
      </div>
    </section>
  );
}
