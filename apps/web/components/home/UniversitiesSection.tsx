const universities = [
  { id: 1, name: "Amity University", abbr: "AMITY", color: "#1E3A8A" },
  { id: 2, name: "University of Hyderabad", abbr: "UoH", color: "#7C2D12" },
  { id: 3, name: "Delhi University", abbr: "DU", color: "#064E3B" },
  { id: 4, name: "IIT Bombay", abbr: "IIT-B", color: "#1E3A8A" },
  { id: 5, name: "NIT Trichy", abbr: "NIT-T", color: "#4C1D95" },
  { id: 6, name: "BITS Pilani", abbr: "BITS", color: "#7C2D12" },
];

export function UniversitiesSection() {
  return (
    <section className="px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] sm:text-xl font-bold text-[#111827]">
          Universities
        </h2>
        <button className="text-[13px] font-semibold text-orange-500 underline underline-offset-2">
          View all
        </button>
      </div>

      {/* Mobile: horizontal scroll | sm+: 3-col | lg+: 6-col */}
      <div
        className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {universities.map((uni) => (
          <button
            key={uni.id}
            className="flex-shrink-0 w-[132px] sm:w-auto bg-white rounded-2xl flex flex-col items-center justify-center gap-2 p-4 shadow-sm border border-gray-100 min-h-[108px]"
          >
            {/* Logo placeholder */}
            <div
              className="w-[60px] h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${uni.color}18` }}
            >
              <span
                className="text-[10px] font-black tracking-tight"
                style={{ color: uni.color }}
              >
                {uni.abbr}
              </span>
            </div>
            <p className="text-[11.5px] font-medium text-[#374151] text-center leading-tight">
              {uni.name}
            </p>
          </button>
        ))}
        <div className="w-2 flex-shrink-0 sm:hidden" />
      </div>
    </section>
  );
}
