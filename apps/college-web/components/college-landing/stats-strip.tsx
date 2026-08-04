import { Star } from "lucide-react";

interface Stat {
  label: string;
  value: string;
}

interface StatsStripProps {
  stats: Stat[];
  avgRating: string | null;
  reviewCount: number | null;
}

export function StatsStrip({ stats, avgRating, reviewCount }: StatsStripProps) {
  const ratingValue = avgRating ? Number(avgRating) : 0;
  const showRating = ratingValue > 0;

  if (stats.length === 0 && !showRating) return null;

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
        {showRating ? (
          <div>
            <p className="flex items-center gap-1 text-2xl font-bold tracking-tight">
              {ratingValue.toFixed(1)}
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {reviewCount ?? 0} student review{reviewCount === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
