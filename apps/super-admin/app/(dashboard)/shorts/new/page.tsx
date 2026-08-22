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
import { ShortVideoUpload } from "@/components/short-video-upload";
import { useCreateShort } from "@/hooks/use-shorts";

export default function NewShortPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateShort();

  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnailUrl) {
      toast.error("Please upload a thumbnail image");
      return;
    }
    if (!videoUrl) {
      toast.error("Please upload a video");
      return;
    }

    create(
      {
        title,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        display_order: Number(displayOrder) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Short created");
          router.push("/shorts");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Add Short" description="Create a new short video">
        <Link href="/shorts">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 max-w-xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              placeholder="e.g. Campus Tour Highlights"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <ImageUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            context="shorts"
            label="Thumbnail Image"
            aspect={9 / 16}
          />

          <div className="space-y-2">
            <Label>Video (max 30 seconds)</Label>
            <ShortVideoUpload
              value={videoUrl}
              onChange={setVideoUrl}
              context="shorts"
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

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Create Short"}
          </Button>
        </form>
      </div>
    </div>
  );
}
