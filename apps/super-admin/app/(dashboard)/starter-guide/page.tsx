"use client";

import Link from "next/link";
import { Plus, ImageOff, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useStarterGuides,
  useDeactivateStarterGuide,
  useActivateStarterGuide,
} from "@/hooks/use-starter-guide";
import type { StarterGuideListItem } from "@beaconu/types";

function GuideCard({ guide }: { guide: StarterGuideListItem }) {
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateStarterGuide();
  const { mutate: activate, isPending: isActivating } =
    useActivateStarterGuide();
  const isPending = isDeactivating || isActivating;

  return (
    <Card className="border-none shadow-sm hover:ring-1 hover:ring-primary/20 transition-all overflow-hidden">
      <div className="aspect-video w-full bg-muted overflow-hidden">
        {guide.thumbnailUrl ? (
          <img
            src={guide.thumbnailUrl}
            alt={guide.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <p className="font-bold text-base leading-tight">{guide.title}</p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ml-2",
              guide.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200",
            )}
          >
            {guide.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Order: {guide.displayOrder}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/starter-guide/${guide.id}`} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-9 group justify-between px-2"
            >
              <span className="text-xs font-medium">Manage</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {guide.isActive ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Deactivate"
              onClick={() =>
                deactivate(guide.id, {
                  onSuccess: () => toast.success("Guide deactivated"),
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
                activate(guide.id, {
                  onSuccess: () => toast.success("Guide activated"),
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
  const { data, isLoading } = useStarterGuides();
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Starter Guide"
        description="Manage onboarding guides shown to new users"
      >
        <Link href="/starter-guide/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guide
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        {isLoading ? (
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
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No starter guides yet. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {items.length} of {meta.total} guides
          </p>
        )}
      </div>
    </div>
  );
}
