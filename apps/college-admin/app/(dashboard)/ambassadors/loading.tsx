import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AmbassadorsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b bg-muted/50 px-4 py-3 grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="px-4 py-4 grid grid-cols-5 gap-4 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 self-center" />
              <Skeleton className="h-4 w-28 self-center" />
              <Skeleton className="h-5 w-16 rounded-full self-center" />
              <Skeleton className="h-4 w-24 self-center" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
