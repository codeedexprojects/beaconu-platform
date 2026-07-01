import { Skeleton } from "@/components/ui/skeleton";

export default function CampusVisitDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-5">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
