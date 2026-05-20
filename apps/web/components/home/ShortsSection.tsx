const shorts = [
  { id: 1, bg: "linear-gradient(135deg, #374151, #1F2937)", label: "0:32" },
  { id: 2, bg: "linear-gradient(135deg, #1E3A5F, #1E40AF)", label: "0:45" },
  { id: 3, bg: "linear-gradient(135deg, #2D3748, #4A5568)", label: "0:28" },
  { id: 4, bg: "linear-gradient(135deg, #1A202C, #2D3748)", label: "0:38" },
];

export function ShortsSection() {
  return (
    <section className="px-4">
      <h2 className="text-[17px] font-bold text-[#111827] mb-3">Shorts</h2>

      <div
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {shorts.map((short) => (
          <button
            key={short.id}
            className="flex-shrink-0 rounded-2xl overflow-hidden relative"
            style={{
              width: 158,
              height: 112,
              background: short.bg,
            }}
          >
            {/* Top dots */}
            <div className="absolute top-2.5 left-3 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <div className="w-2 h-2 rounded-full bg-white/25" />
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </div>
            </div>

            {/* Duration */}
            <div className="absolute bottom-2.5 left-3">
              <span className="bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                {short.label}
              </span>
            </div>
          </button>
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>
    </section>
  );
}
