import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-3.5 border-b last:border-0"
              >
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
