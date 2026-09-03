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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCreateFeedItem } from "@/hooks/use-feed";

export default function NewFeedItemPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateFeedItem();

  const [caption, setCaption] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnailUrl) {
      toast.error("Please upload a thumbnail image");
      return;
    }

    create(
      {
        caption,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        display_order: Number(displayOrder) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Feed item created");
          router.push("/feed");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Add Feed Item" description="Create a new feed post">
        <Link href="/feed">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 max-w-xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="What's this post about?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              required
            />
          </div>

          <ImageUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            context="feed"
            label="Thumbnail Image"
            aspect={16 / 9}
          />

          <div className="space-y-2">
            <Label htmlFor="video_url">YouTube Video Link</Label>
            <Input
              id="video_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
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

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Create Feed Item"}
          </Button>
        </form>
      </div>
    </div>
  );
}
