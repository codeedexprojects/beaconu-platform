import Link from "next/link";
import { ArrowLeft, Bus } from "lucide-react";
import { CommuteRoutes } from "@/components/college-landing/commute-routes";
import type { PublicCommuteSection } from "@beaconu/types";

interface CommuteSectionProps {
  commute: PublicCommuteSection;
  subdomain: string;
}

export function CommuteSection({ commute, subdomain }: CommuteSectionProps) {
  const routes = commute.routes ?? [];
  const pickupPoints = commute.pickup_points ?? [];
  const rules = commute.rules_and_code_of_conduct;

  if (routes.length === 0 && pickupPoints.length === 0 && !rules?.rules?.length)
    return null;

  return (
    <section id="commute" className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/college/${subdomain}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Back to college page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <Bus className="h-6 w-6" />
              {commute.title || "Commute & Transport"}
            </h1>
          </div>
          {typeof commute.route_count === "number" ? (
            <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white">
              {commute.route_count} route{commute.route_count === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {pickupPoints.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pickupPoints.map((point, i) => (
              <span
                key={`${point}-${i}`}
                className={
                  point === commute.selected_pickup_point
                    ? "inline-flex items-center rounded-full bg-headerTeal-dark px-3.5 py-1.5 text-sm text-white"
                    : "inline-flex items-center rounded-full bg-field px-3.5 py-1.5 text-sm text-foreground"
                }
              >
                {point}
              </span>
            ))}
          </div>
        ) : null}

        {routes.length > 0 ? <CommuteRoutes routes={routes} /> : null}

        {rules?.rules && rules.rules.length > 0 ? (
          <div className="mt-10 rounded-2xl bg-field p-6">
            <h3 className="text-lg font-semibold">
              {rules.title || "Code of Conduct"}
            </h3>
            {rules.subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {rules.subtitle}
              </p>
            ) : null}
            {rules.intro ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {rules.intro}
              </p>
            ) : null}
            <ol className="mt-4 space-y-3">
              {rules.rules.map((rule, i) => (
                <li key={`${rule.title}-${i}`} className="text-sm">
                  <span className="font-medium">{rule.title}</span>
                  {rule.description ? (
                    <span className="text-muted-foreground">
                      {" "}
                      — {rule.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
