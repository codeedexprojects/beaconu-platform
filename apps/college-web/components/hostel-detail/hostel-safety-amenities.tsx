import Image from "next/image";
import { CheckCircle2, ShieldCheck, User } from "lucide-react";
import type {
  PublicHostelAmenities,
  PublicHostelRules,
  PublicHostelSafetyWarden,
} from "@beaconu/types";

interface HostelSafetyAmenitiesProps {
  safety?: PublicHostelSafetyWarden;
  amenities?: PublicHostelAmenities;
  rules?: PublicHostelRules;
}

export function HostelSafetyAmenities({
  safety,
  amenities,
  rules,
}: HostelSafetyAmenitiesProps) {
  const hasSafety = (safety?.features?.length ?? 0) > 0 || safety?.warden;
  const hasAmenities = (amenities?.items?.length ?? 0) > 0;
  const hasRules = (rules?.items?.length ?? 0) > 0;

  if (!hasSafety && !hasAmenities && !hasRules) return null;

  return (
    <section className="grid gap-6 sm:grid-cols-2">
      {hasSafety ? (
        <div className="rounded-2xl border border-border/60 p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            {safety?.title || "Safety & Warden"}
          </h3>
          {safety?.warden ? (
            <div className="mt-3 flex items-center gap-3">
              {safety.warden.photo ? (
                <Image
                  src={safety.warden.photo}
                  alt={safety.warden.name ?? "Warden"}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
              <div>
                <p className="text-sm font-medium">{safety.warden.name}</p>
                <p className="text-xs text-muted-foreground">
                  {safety.warden.designation}
                </p>
              </div>
            </div>
          ) : null}
          {(safety?.features?.length ?? 0) > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {safety?.features?.map((f, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border/60 px-2.5 py-1 text-xs"
                >
                  {f.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasAmenities ? (
        <div className="rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-semibold">
            {amenities?.title || "Amenities"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities?.items
              ?.filter((item) => item.selected)
              .map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 text-foreground/70" />
                  {item.label}
                </span>
              ))}
          </div>
        </div>
      ) : null}

      {hasRules ? (
        <div className="rounded-2xl border border-border/60 p-5 sm:col-span-2">
          <h3 className="text-sm font-semibold">{rules?.title || "Rules"}</h3>
          <ol className="mt-3 space-y-2.5">
            {rules?.items?.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {rule.number ?? i + 1}
                </span>
                <span>
                  <span className="font-medium">{rule.title}</span>
                  {rule.description ? (
                    <span className="text-muted-foreground">
                      {" "}
                      — {rule.description}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
