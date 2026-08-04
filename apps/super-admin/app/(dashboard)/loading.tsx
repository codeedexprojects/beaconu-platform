import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      <div className="flex gap-4 px-4 py-3 border-b">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20 ml-auto" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0"
        >
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full ml-auto" />
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-52 rounded-lg hidden md:block" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-7 w-16 rounded-lg" />
            </CardHeader>
            <TableSkeleton rows={5} />
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
