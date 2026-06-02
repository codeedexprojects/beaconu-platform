import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CollegeDetailLoading() {
  return (
    <>
      <Header title="College Detail" />

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Back link */}
        <Skeleton className="h-4 w-28" />

        {/* Hero */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-10" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-4 border-b pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-4 w-24" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex gap-3 py-2 border-b last:border-0"
                  >
                    <Skeleton className="h-4 w-4 mt-1 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
