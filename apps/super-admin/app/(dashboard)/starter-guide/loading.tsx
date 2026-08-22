import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b bg-background px-6 py-4">
        <Skeleton className="h-7 w-40 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
