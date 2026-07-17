import { cn } from "@/lib/utils";
import type { CampusVisitAvailabilityEntry } from "@beaconu/types";

interface AvailabilityStripProps {
  availability: CampusVisitAvailabilityEntry[];
}

export function AvailabilityStrip({ availability }: AvailabilityStripProps) {
  if (availability.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Visiting Hours
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {availability.map((day) => (
          <div
            key={day.weekday}
            className={cn(
              "rounded-lg p-2 text-center",
              day.isOff ? "bg-muted/60" : "bg-muted",
            )}
          >
            <p className="text-[10px] font-medium text-muted-foreground">
              {day.weekday.slice(0, 3)}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                day.isOff && "text-muted-foreground/60",
              )}
            >
              {day.isOff ? "Closed" : day.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
