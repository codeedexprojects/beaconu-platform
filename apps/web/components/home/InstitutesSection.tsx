const institutes = [
  { id: 1, name: "IIIT", count: 24, abbr: "IIIT", color: "#1E3A8A" },
  { id: 2, name: "IISER", count: 24, abbr: "IISER", color: "#064E3B" },
  { id: 3, name: "AIIMS", count: 24, abbr: "AIIMS", color: "#7C2D12" },
  { id: 4, name: "IIT", count: 23, abbr: "IIT", color: "#4C1D95" },
  { id: 5, name: "NIT", count: 31, abbr: "NIT", color: "#1E3A8A" },
];

export function InstitutesSection() {
  return (
    <section className="px-4 md:px-6 lg:px-8">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-[17px] sm:text-xl font-bold text-[#111827] leading-snug">
          Institutes of National Importance
        </h2>
        <button className="text-[13px] font-semibold text-orange-500 underline underline-offset-2 flex-shrink-0 mt-0.5">
          View all
        </button>
      </div>

      <div
        className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {institutes.map((inst) => (
          <button
            key={inst.id}
            className="flex-shrink-0 w-[108px] sm:w-auto bg-white rounded-2xl flex flex-col items-center justify-center gap-1.5 p-4 shadow-sm border border-gray-100 min-h-[120px]"
          >
            <div
              className="w-14 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${inst.color}15` }}
            >
              <span
                className="text-[10px] font-black"
                style={{ color: inst.color }}
              >
                {inst.abbr}
              </span>
            </div>
            <p className="text-[13px] font-bold" style={{ color: inst.color }}>
              {inst.name}
            </p>
            <p className="text-[12px] text-gray-500 font-medium">
              {inst.count}
            </p>
          </button>
        ))}
        <div className="w-2 flex-shrink-0 sm:hidden" />
      </div>
    </section>
  );
}
