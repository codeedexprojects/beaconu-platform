import { Badge } from "@/components/ui/badge";
import type {
  PublicCourseAdmissionBatch,
  PublicCourseQuickInfoItem,
} from "@beaconu/types";

interface CourseHeaderProps {
  name: string;
  quickInfo: PublicCourseQuickInfoItem[];
  admissionBatches: PublicCourseAdmissionBatch[];
}

export function CourseHeader({
  name,
  quickInfo,
  admissionBatches,
}: CourseHeaderProps) {
  const activeBanner = admissionBatches.find((b) => b.banner?.enabled);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>

      {quickInfo.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickInfo.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-sm"
            >
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </span>
          ))}
        </div>
      ) : null}

      {admissionBatches.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {admissionBatches.map((batch, i) => (
            <Badge
              key={`${batch.label}-${i}`}
              variant={batch.status === "open" ? "default" : "outline"}
            >
              {batch.label}
              {batch.status ? ` · ${batch.status}` : ""}
            </Badge>
          ))}
        </div>
      ) : null}

      {activeBanner?.banner?.message ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {activeBanner.banner.tag ? (
            <span className="mr-2 font-semibold">
              {activeBanner.banner.tag}
            </span>
          ) : null}
          {activeBanner.banner.message}
          {typeof activeBanner.banner.progress_percentage === "number" ? (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-600"
                style={{
                  width: `${Math.min(100, Math.max(0, activeBanner.banner.progress_percentage))}%`,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
