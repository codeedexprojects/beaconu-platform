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
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import {
  useVideoTestimonial,
  useUpdateVideoTestimonial,
  useDeactivateVideoTestimonial,
  useActivateVideoTestimonial,
} from "@/hooks/use-video-testimonials";

export default function VideoTestimonialDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: testimonial, isLoading } = useVideoTestimonial(id);
  const { mutate: update, isPending: isUpdating } = useUpdateVideoTestimonial();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateVideoTestimonial();
  const { mutate: activate, isPending: isActivating } =
    useActivateVideoTestimonial();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [studentImageUrl, setStudentImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  useEffect(() => {
    if (testimonial) {
      setTitle(testimonial.title);
      setVideoUrl(testimonial.videoUrl);
      setThumbnailUrl(testimonial.thumbnailUrl);
      setStudentImageUrl(testimonial.studentImageUrl);
      setDisplayOrder(String(testimonial.displayOrder));
    }
  }, [testimonial]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnailUrl) {
      toast.error("Please upload a thumbnail image");
      return;
    }
    if (!studentImageUrl) {
      toast.error("Please upload a student image");
      return;
    }

    update(
      {
        id,
        data: {
          title,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          student_image_url: studentImageUrl,
          display_order: Number(displayOrder) || 0,
        },
      },
      { onSuccess: () => toast.success("Testimonial updated") },
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

  if (!testimonial) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Header title={testimonial.title} description={`ID: ${testimonial.id}`}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              testimonial.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200",
            )}
          >
            {testimonial.isActive ? "Active" : "Inactive"}
          </span>
          {testimonial.isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isStatusPending}
              onClick={() =>
                deactivate(id, {
                  onSuccess: () => toast.success("Testimonial deactivated"),
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
                  onSuccess: () => toast.success("Testimonial activated"),
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
          <Link href="/video-testimonials">
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
            <Label htmlFor="video_url">Video (YouTube link)</Label>
            <Input
              id="video_url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>

          <ImageUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            context="video-testimonials"
            label="Thumbnail Image"
            aspect={16 / 9}
          />

          <ImageUpload
            value={studentImageUrl}
            onChange={setStudentImageUrl}
            context="video-testimonials"
            label="Student Image"
            aspect={1}
          />

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

          <Button type="submit" disabled={isUpdating} className="w-full gap-2">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
