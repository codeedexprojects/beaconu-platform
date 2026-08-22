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
import { StarterGuideStepsEditor } from "@/components/starter-guide-steps-editor";
import { useCreateStarterGuide } from "@/hooks/use-starter-guide";
import type { StarterGuideStep } from "@beaconu/types";

export default function NewStarterGuidePage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateStarterGuide();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [steps, setSteps] = useState<StarterGuideStep[]>([
    { title: "", description: "" },
  ]);

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

    create(
      {
        title,
        description: description.trim() || undefined,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        steps: cleanSteps,
        display_order: Number(displayOrder) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Starter guide created");
          router.push("/starter-guide");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Add Guide" description="Create a new starter guide">
        <Link href="/starter-guide">
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
              placeholder="e.g. Getting Started with BeaconU"
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

          <StarterGuideStepsEditor steps={steps} onChange={setSteps} />

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Create Guide"}
          </Button>
        </form>
      </div>
    </div>
  );
}
