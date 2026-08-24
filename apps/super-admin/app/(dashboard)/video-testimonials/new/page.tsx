"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCreateVideoTestimonial } from "@/hooks/use-video-testimonials";

export default function NewVideoTestimonialPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateVideoTestimonial();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [studentImageUrl, setStudentImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

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

    create(
      {
        title,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        student_image_url: studentImageUrl,
        display_order: Number(displayOrder) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Video testimonial created");
          router.push("/video-testimonials");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Add Video Testimonial"
        description="Create a new student video testimonial"
      >
        <Link href="/video-testimonials">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 max-w-xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Got offers from Christ University"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video (YouTube link)</Label>
            <Input
              id="video_url"
              placeholder="https://www.youtube.com/watch?v=..."
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

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Create Testimonial"}
          </Button>
        </form>
      </div>
    </div>
  );
}
