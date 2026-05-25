import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-2 mb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
