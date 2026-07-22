import { Bus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommuteRoutes } from "@/components/college-landing/commute-routes";
import type { PublicCommuteSection } from "@beaconu/types";

interface CommuteSectionProps {
  commute: PublicCommuteSection;
}

export function CommuteSection({ commute }: CommuteSectionProps) {
  const routes = commute.routes ?? [];
  const pickupPoints = commute.pickup_points ?? [];
  const rules = commute.rules_and_code_of_conduct;

  if (routes.length === 0 && pickupPoints.length === 0 && !rules?.rules?.length)
    return null;

  return (
    <section id="commute" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Bus className="h-6 w-6" />
            {commute.title || "Commute & Transport"}
          </h2>
          {typeof commute.route_count === "number" ? (
            <Badge variant="outline">
              {commute.route_count} route{commute.route_count === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>

        {pickupPoints.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {pickupPoints.map((point, i) => (
              <span
                key={`${point}-${i}`}
                className={
                  point === commute.selected_pickup_point
                    ? "inline-flex items-center rounded-full bg-foreground px-3.5 py-1.5 text-sm text-background"
                    : "inline-flex items-center rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-sm"
                }
              >
                {point}
              </span>
            ))}
          </div>
        ) : null}

        {routes.length > 0 ? <CommuteRoutes routes={routes} /> : null}

        {rules?.rules && rules.rules.length > 0 ? (
          <div className="mt-10 rounded-2xl border border-border/60 bg-background p-6">
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
