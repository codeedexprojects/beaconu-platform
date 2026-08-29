import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {commute.title || "Commute"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Safe, reliable and comfortable transportation to campus.
          </p>
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
                    : "inline-flex items-center rounded-full border border-border/60 bg-white px-3.5 py-1.5 text-sm text-foreground"
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
