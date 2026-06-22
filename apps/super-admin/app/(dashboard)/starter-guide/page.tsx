"use client";

import Link from "next/link";
import { Plus, Video, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useStarterGuideVideos,
  useDeactivateStarterGuideVideo,
  useActivateStarterGuideVideo,
} from "@/hooks/use-starter-guide-videos";
import type { StarterGuideVideoListItem } from "@beaconu/types";

function VideoCard({ video }: { video: StarterGuideVideoListItem }) {
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateStarterGuideVideo();
  const { mutate: activate, isPending: isActivating } =
    useActivateStarterGuideVideo();
  const isPending = isDeactivating || isActivating;

  return (
    <Card className="border-none shadow-sm hover:ring-1 hover:ring-primary/20 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
              video.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200",
            )}
          >
            {video.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="font-bold text-base leading-tight">{video.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Order: {video.displayOrder}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/starter-guide/${video.id}`} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-9 group justify-between px-2"
            >
              <span className="text-xs font-medium">Manage</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {video.isActive ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Deactivate"
              onClick={() =>
                deactivate(video.id, {
                  onSuccess: () => toast.success("Video deactivated"),
                })
              }
            >
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Activate"
              onClick={() =>
                activate(video.id, {
                  onSuccess: () => toast.success("Video activated"),
                })
              }
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StarterGuidePage() {
  const { data, isLoading } = useStarterGuideVideos();
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Starter Guide"
        description="Manage onboarding videos shown to new users"
      >
        <Link href="/starter-guide/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No starter guide videos yet. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {items.length} of {meta.total} videos
          </p>
        )}
      </div>
    </div>
  );
}
