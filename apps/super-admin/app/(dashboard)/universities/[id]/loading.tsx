import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function UniversityDetailLoading() {
  return (
    <>
      <Header title="University Detail" />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-4 w-32" />

        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-3 w-24" />
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

        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
