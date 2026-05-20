export function OnlyAtBeaconU() {
  return (
    <section className="px-4">
      {/* Header */}
      <p className="text-[15px] font-semibold text-[#111827] text-center mb-3">
        Only @ <span className="text-blue-600 font-bold">BeaconU</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Psychometric assessment */}
        <button
          className="rounded-3xl overflow-hidden relative p-4 text-left flex flex-col"
          style={{ backgroundColor: "#1E3A8A", minHeight: 148 }}
        >
          {/* Background decoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-8 right-2 w-12 h-12 rounded-full bg-white/5" />

          {/* Girl with question mark icon */}
          <div className="absolute top-3 right-3 w-16 h-16 flex items-center justify-center opacity-60">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              <path
                d="M12 3v1m4.95 1.05L16 6M21 8h-1m-1.05 4.95L18 12M12 21v-1m-4.95-1.05L9 18M3 8h1m1.05-4.95L6 4"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Floating "?" */}
          <div className="absolute top-1 right-1 text-white/40 text-2xl font-black">
            ?
          </div>

          <div className="mt-auto pt-6">
            <p className="text-white text-[13px] font-bold leading-tight">
              Psychometric
              <br />
              assessment
            </p>
          </div>
        </button>

        {/* Group Finder */}
        <button
          className="rounded-3xl overflow-hidden relative p-4 text-left flex flex-col"
          style={{ backgroundColor: "#7C3AED", minHeight: 148 }}
        >
          {/* Background decoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-8 right-2 w-12 h-12 rounded-full bg-white/5" />

          {/* Group icon */}
          <div className="absolute top-3 right-2 w-16 h-16 flex items-center justify-center opacity-70">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <div className="mt-auto pt-6">
            <p className="text-white text-[13px] font-bold leading-tight">
              Group Finder
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
