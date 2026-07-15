"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Video } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePresignStarterGuideVideoUpload,
  useCreateStarterGuideVideo,
} from "@/hooks/use-starter-guide-videos";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  display_order: z.coerce.number().int().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

type UploadPhase = "idle" | "uploading" | "creating";

export default function NewStarterGuideVideoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");

  const { mutateAsync: presign } = usePresignStarterGuideVideoUpload();
  const { mutateAsync: create } = useCreateStarterGuideVideo();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", display_order: 0 },
  });

  async function onSubmit(values: FormValues) {
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    try {
      setPhase("uploading");
      const mime = file.type as "video/mp4" | "video/webm";
      const { uploadUrl, key } = await presign({
        mime_type: mime,
        file_size_bytes: file.size,
      });

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": mime },
      });

      setPhase("creating");
      await create(
        {
          title: values.title,
          video_key: key,
          display_order: values.display_order,
        },
        {
          onSuccess: () => {
            toast.success("Starter guide video created");
            router.push("/starter-guide");
          },
        },
      );
    } catch {
      setPhase("idle");
    }
  }

  const isPending = phase !== "idle";

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Add Video" description="Upload a new starter guide video">
        <Link href="/starter-guide">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 max-w-xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Getting Started with BeaconU"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min={0}
              {...form.register("display_order")}
            />
            {form.formState.errors.display_order && (
              <p className="text-sm text-destructive">
                {form.formState.errors.display_order.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Video File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm">Click to select a video file</p>
                  <p className="text-xs">MP4 or WebM, max 500 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "uploading"
              ? "Uploading video…"
              : phase === "creating"
                ? "Saving…"
                : "Upload & Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
