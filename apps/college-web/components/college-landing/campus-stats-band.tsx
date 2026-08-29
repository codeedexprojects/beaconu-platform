import Image from "next/image";

interface CampusStatsItem {
  label: string;
  value: string;
}

interface CampusStatsBandProps {
  stats?: CampusStatsItem[];
  backgroundImageUrl?: string | null;
}

const PLACEHOLDER_STATS: CampusStatsItem[] = [
  { label: "Staff Members", value: "130+" },
  { label: "Students", value: "2500+" },
  { label: "Programmes", value: "31" },
  { label: "Vast Campus", value: "100+ Acres" },
];

function splitValue(value: string): { number: string; suffix: string } {
  const match = value.match(/^([\d.,]+\+?)\s*(.*)$/);
  if (!match) return { number: value, suffix: "" };
  return { number: match[1], suffix: match[2] };
}

export function CampusStatsBand({
  stats,
  backgroundImageUrl,
}: CampusStatsBandProps) {
  const filtered = (stats ?? []).filter((s) => s.label && s.value);
  const items = (filtered.length > 0 ? filtered : PLACEHOLDER_STATS).slice(
    0,
    4,
  );
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-950">
        {backgroundImageUrl ? (
          <Image
            src={backgroundImageUrl}
            alt="Campus"
            fill
            sizes="100vw"
            className="object-cover opacity-50"
          />
        ) : null}
      </div>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-4 sm:px-6">
        {items.map((stat, i) => {
          const { number, suffix } = splitValue(stat.value ?? "");
          return (
            <div
              key={`${stat.label}-${i}`}
              className="text-center sm:text-left"
            >
              <p className="text-3xl font-bold text-white sm:text-4xl">
                {number}
                {suffix ? (
                  <span className="ml-1 text-base font-semibold">{suffix}</span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
