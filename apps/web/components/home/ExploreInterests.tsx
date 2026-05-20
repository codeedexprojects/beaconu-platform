const interests = [
  {
    id: 1,
    name: "Management",
    courses: 120,
    color: "#3B82F6",
    bg: "#EFF6FF",
    shape: "M4 4h4v4H4zm0 6h4v4H4zm6-6h4v4h-4zm6 0h4v4h-4z",
  },
  {
    id: 2,
    name: "Medicine & pharmacy",
    courses: 420,
    color: "#10B981",
    bg: "#ECFDF5",
    shape: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    id: 3,
    name: "Data science",
    courses: 120,
    color: "#D97706",
    bg: "#FFFBEB",
    shape: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    id: 4,
    name: "Design",
    courses: 420,
    color: "#7C3AED",
    bg: "#F5F3FF",
    shape: "M12 2L2 7l10 5 10-5-10-5z",
  },
  {
    id: 5,
    name: "Finance & Banking",
    courses: 120,
    color: "#7C3AED",
    bg: "#F5F3FF",
    shape: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    id: 6,
    name: "Engineering",
    courses: 420,
    color: "#6B7280",
    bg: "#F9FAFB",
    shape: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77",
  },
  {
    id: 7,
    name: "Hospitality & tourism",
    courses: 120,
    color: "#3B82F6",
    bg: "#EFF6FF",
    shape: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    id: 8,
    name: "Sports & nutrition",
    courses: 420,
    color: "#EF4444",
    bg: "#FEF2F2",
    shape: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  },
];

export function ExploreInterests() {
  return (
    <section className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-[#111827]">
          Explore your interest
        </h2>
        <button className="text-[13px] font-semibold text-orange-500 underline underline-offset-2">
          View all
        </button>
      </div>

      {/* Blue-border grid container */}
      <div className="border-2 border-blue-200 rounded-3xl p-3">
        <div className="grid grid-cols-2 gap-3">
          {interests.map((item) => (
            <button
              key={item.id}
              className="bg-white rounded-2xl p-3 text-left shadow-sm border border-gray-50 flex flex-col min-h-[120px]"
            >
              <p className="text-[13.5px] font-bold text-[#111827] mb-0.5 leading-tight">
                {item.name}
              </p>
              <p
                className="text-[12px] font-semibold mb-auto"
                style={{ color: item.color }}
              >
                {item.courses} courses
              </p>
              {/* Illustration placeholder */}
              <div className="flex justify-end mt-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.shape} />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
