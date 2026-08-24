import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b bg-background px-6 py-4">
        <Skeleton className="h-7 w-24 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm overflow-hidden">
              <Skeleton className="aspect-[9/16] w-full rounded-none max-h-56" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
