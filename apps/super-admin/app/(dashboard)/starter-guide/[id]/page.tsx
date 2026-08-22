"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { StarterGuideStepsEditor } from "@/components/starter-guide-steps-editor";
import { cn } from "@/lib/utils";
import {
  useStarterGuide,
  useUpdateStarterGuide,
  useDeactivateStarterGuide,
  useActivateStarterGuide,
} from "@/hooks/use-starter-guide";
import type { StarterGuideStep } from "@beaconu/types";

export default function StarterGuideDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: guide, isLoading } = useStarterGuide(id);
  const { mutate: update, isPending: isUpdating } = useUpdateStarterGuide();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateStarterGuide();
  const { mutate: activate, isPending: isActivating } =
    useActivateStarterGuide();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [steps, setSteps] = useState<StarterGuideStep[]>([]);

  useEffect(() => {
    if (guide) {
      setTitle(guide.title);
      setDescription(guide.description ?? "");
      setThumbnailUrl(guide.thumbnailUrl);
      setVideoUrl(guide.videoUrl);
      setDisplayOrder(String(guide.displayOrder));
      setSteps(
        guide.steps.length > 0 ? guide.steps : [{ title: "", description: "" }],
      );
    }
  }, [guide]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnailUrl) {
      toast.error("Please upload a thumbnail image");
      return;
    }
    const cleanSteps = steps.filter(
      (s) => s.title.trim() && s.description.trim(),
    );
    if (cleanSteps.length === 0) {
      toast.error("Add at least one step");
      return;
    }

    update(
      {
        id,
        data: {
          title,
          description: description.trim() || undefined,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          steps: cleanSteps,
          display_order: Number(displayOrder) || 0,
        },
      },
      { onSuccess: () => toast.success("Guide updated") },
    );
  }

  const isStatusPending = isDeactivating || isActivating;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="border-b bg-background px-6 py-4">
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 max-w-xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!guide) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Header title={guide.title} description={`ID: ${guide.id}`}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              guide.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200",
            )}
          >
            {guide.isActive ? "Active" : "Inactive"}
          </span>
          {guide.isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isStatusPending}
              onClick={() =>
                deactivate(id, {
                  onSuccess: () => toast.success("Guide deactivated"),
                })
              }
            >
              {isDeactivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isStatusPending}
              onClick={() =>
                activate(id, {
                  onSuccess: () => toast.success("Guide activated"),
                })
              }
            >
              {isActivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              Activate
            </Button>
          )}
          <Link href="/starter-guide">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </Header>

      <div className="flex-1 p-6 max-w-xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A short summary shown alongside this guide"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <ImageUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            context="starter-guide"
            label="Thumbnail Image"
            aspect={16 / 9}
          />

          <div className="space-y-2">
            <Label htmlFor="video_url">Video (YouTube link)</Label>
            <Input
              id="video_url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>

          <StarterGuideStepsEditor steps={steps} onChange={setSteps} />

          <Button type="submit" disabled={isUpdating} className="w-full gap-2">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
