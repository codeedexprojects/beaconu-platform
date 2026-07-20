import Image from "next/image";
import type { PublicDemographicsTab } from "@beaconu/types";

interface PercentRow {
  label: string;
  percent: number;
  media?: string;
  subtitle?: string;
}

function PercentBarList({
  title,
  rows,
  roundedMedia,
}: {
  title: string;
  rows: PercentRow[];
  roundedMedia?: boolean;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <div key={i}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {row.media ? (
                  <Image
                    src={row.media}
                    alt={row.label}
                    width={18}
                    height={18}
                    className={
                      roundedMedia
                        ? "h-[18px] w-[18px] shrink-0 rounded-full object-cover"
                        : "h-[18px] w-[18px] shrink-0 object-contain"
                    }
                  />
                ) : null}
                <span className="truncate">
                  {row.label}
                  {row.subtitle ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {row.subtitle}
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="shrink-0 font-medium">{row.percent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${Math.min(100, Math.max(0, row.percent))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DemographicsSectionProps {
  demographics: PublicDemographicsTab;
}

export function DemographicsSection({
  demographics,
}: DemographicsSectionProps) {
  const ageRows: PercentRow[] = (
    demographics.age_distribution?.items ?? []
  ).map((item) => ({ label: item.label ?? "", percent: item.percent ?? 0 }));
  const genderRows: PercentRow[] = (
    demographics.gender_diversity?.segments ?? []
  ).map((item) => ({ label: item.label ?? "", percent: item.percent ?? 0 }));
  const experienceRows: PercentRow[] = (
    demographics.work_experience?.items ?? []
  ).map((item) => ({
    label: item.label ?? "",
    percent: item.percent ?? 0,
    subtitle: item.subtitle,
    media: item.icon,
  }));
  const internationalRows: PercentRow[] = (
    demographics.international_presence?.items ?? []
  ).map((item) => ({
    label: item.country ?? "",
    percent: item.percent ?? 0,
    media: item.flag,
  }));
  const nationalRows: PercentRow[] = (
    demographics.national_presence?.items ?? []
  ).map((item) => ({ label: item.state ?? "", percent: item.percent ?? 0 }));

  const hasContent =
    ageRows.length > 0 ||
    genderRows.length > 0 ||
    experienceRows.length > 0 ||
    internationalRows.length > 0 ||
    nationalRows.length > 0;

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Batch demographics aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Batch Demographics</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <PercentBarList title="Age Distribution" rows={ageRows} />
        <PercentBarList title="Gender Diversity" rows={genderRows} />
        <PercentBarList
          title="Work Experience"
          rows={experienceRows}
          roundedMedia
        />
        <PercentBarList title="National Presence" rows={nationalRows} />
        <PercentBarList
          title="International Presence"
          rows={internationalRows}
          roundedMedia
        />
      </div>
    </div>
  );
}
