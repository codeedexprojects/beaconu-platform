import Image from "next/image";
import { Download, ExternalLink, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicPlacementsTab } from "@beaconu/types";

interface PlacementsSectionProps {
  placements: PublicPlacementsTab;
}

function CompanyLogo({
  logo,
  name,
  initial,
  bgColor,
}: {
  logo?: string;
  name?: string;
  initial?: string;
  bgColor?: string;
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={name ?? "Company"}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-lg object-contain"
      />
    );
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ backgroundColor: bgColor || "#111827" }}
    >
      {initial}
    </span>
  );
}

export function PlacementsSection({ placements }: PlacementsSectionProps) {
  const stats = placements.summary_stats ?? [];
  const offers = placements.notable_offers?.items ?? [];
  const trends = placements.placement_trends?.data_points ?? [];
  const companyRows = placements.all_company_statistics?.rows ?? [];
  const industryRows = placements.industry_salary_report?.rows ?? [];
  const successStories = placements.student_success?.items ?? [];

  const hasContent =
    stats.length > 0 ||
    offers.length > 0 ||
    trends.length > 0 ||
    companyRows.length > 0 ||
    industryRows.length > 0;

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Placement details aren&apos;t available yet.
      </div>
    );
  }

  const maxTrend = Math.max(...trends.map((t) => t.avg_package ?? 0), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
      {stats.length > 0 ? (
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 p-4 text-center"
              >
                <p className="text-xl font-bold tracking-tight">
                  {stat.value}
                  <span className="text-sm font-normal text-muted-foreground">
                    {stat.unit}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          {placements.download_report?.url ? (
            <a
              href={placements.download_report.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium hover:border-foreground/30"
            >
              <Download className="h-4 w-4" />
              {placements.download_report.label || "Download Report"}
            </a>
          ) : null}
        </section>
      ) : null}

      {offers.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            {placements.notable_offers?.title || "Notable Offers"}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <CompanyLogo
                    logo={offer.company_logo}
                    name={offer.company_name}
                    initial={offer.company_initial}
                  />
                  {offer.badge ? (
                    <Badge variant="default">{offer.badge}</Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {offer.company_name}
                </p>
                <p className="text-xs text-muted-foreground">{offer.role}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                  <span className="text-muted-foreground">
                    {offer.package_label}
                  </span>
                  <span className="font-semibold">
                    {offer.package} {offer.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {trends.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              {placements.placement_trends?.title || "Placement Trends"}
            </h2>
            {placements.placement_trends?.footer ? (
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {placements.placement_trends.footer.value}
              </span>
            ) : null}
          </div>
          <div className="mt-6 flex items-end gap-4">
            {trends.map((point, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium">
                  {point.avg_package} LPA
                </span>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${((point.avg_package ?? 0) / maxTrend) * 120}px`,
                    backgroundColor: point.highlighted ? "#111827" : "#e5e7eb",
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {point.year}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {companyRows.length > 0 || industryRows.length > 0 ? (
        <section className="grid gap-8 lg:grid-cols-2">
          {companyRows.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {placements.all_company_statistics?.title ||
                  "Company Statistics"}
              </h2>
              <div className="mt-4 space-y-3">
                {companyRows.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo
                        logo={row.company_logo}
                        name={row.company_name}
                        initial={row.company_initial}
                        bgColor={row.logo_bg_color}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {row.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.students_placed} placed · Avg {row.avg_package} ·
                          Max {row.max_package}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${row.progress_percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {industryRows.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {placements.industry_salary_report?.title ||
                  "Industry & Salary Report"}
              </h2>
              <div className="mt-4 space-y-3">
                {industryRows.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{row.industry}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.subtitle}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.students_placed} placed · Avg {row.avg_package} ·
                        Max {row.max_package}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${row.progress_percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {successStories.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            {placements.student_success?.title || "Student Success"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {successStories.map((story, i) => (
              <a
                key={i}
                href={story.video_url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-border/60"
              >
                {story.thumbnail ? (
                  <div className="relative h-40 w-full bg-muted">
                    <Image
                      src={story.thumbnail}
                      alt={story.student_name ?? "Student"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <p className="text-sm italic text-muted-foreground">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {story.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Placed at {story.placed_at}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
