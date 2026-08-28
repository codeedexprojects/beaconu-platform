import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Trophy } from "lucide-react";

interface AchievementItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
}

interface AchievementsSectionProps {
  subdomain: string;
  achievements?: AchievementItem[];
}

const PLACEHOLDER_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "placeholder-1",
    title: "Calicut University",
    subtitle: "A-Zone",
  },
  {
    id: "placeholder-2",
    title: "Calicut University",
    subtitle: "A-Zone",
  },
  {
    id: "placeholder-3",
    title: "Calicut University",
    subtitle: "A-Zone",
  },
  {
    id: "placeholder-4",
    title: "Calicut University",
    subtitle: "A-Zone",
  },
];

export function AchievementsSection({
  subdomain,
  achievements = PLACEHOLDER_ACHIEVEMENTS,
}: AchievementsSectionProps) {
  if (achievements.length === 0) return null;

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
              <span className="h-px w-6 bg-headerTeal" />
              Excellence Beyond Boundaries
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Achievements
            </h2>
          </div>
          <Link
            href={`/college/${subdomain}#achievements`}
            className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
          >
            View All Achievements
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-2">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="relative aspect-[3/4] w-52 shrink-0 overflow-hidden rounded-2xl bg-muted sm:w-60"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <Trophy className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-headerTeal-dark/90 px-3 py-2.5 text-center">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.subtitle ? (
                  <p className="text-xs text-white/80">{item.subtitle}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
