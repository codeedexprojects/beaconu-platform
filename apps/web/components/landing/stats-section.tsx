const STATS = [
  ["500+", "Partner Colleges"],
  ["2M+", "Students Engaged"],
  ["98%", "Satisfaction Rate"],
  ["40+", "Cities Covered"],
] as const;

export function StatsSection() {
  return (
    <section id="institutions" className="scroll-mt-20 bg-muted px-6 py-16">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-y-10 text-center sm:grid-cols-4">
        {STATS.map(([num, label]) => (
          <div key={label}>
            <div className="font-sans text-4xl font-black tracking-tight text-navy-dark">
              {num}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-gray-label">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
