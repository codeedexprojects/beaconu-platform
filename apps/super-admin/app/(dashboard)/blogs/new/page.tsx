"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateAdminBlog } from "@/hooks/use-blogs";
import { ImageUpload } from "@/components/ui/image-upload";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "Content is required"),
  cover_image_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type FormInput = z.infer<typeof schema>;

export default function NewBlogPage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { mutate, isPending } = useCreateAdminBlog();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", summary: "", content: "", cover_image_url: "" },
  });

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function onSubmit(data: FormInput) {
    mutate(
      {
        title: data.title,
        summary: data.summary || undefined,
        content: data.content,
        cover_image_url: data.cover_image_url || undefined,
        tags,
      },
      {
        onSuccess: () => {
          toast.success("Blog published!");
          router.push("/blogs");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="New Blog Post"
        description="Published immediately — no review step for admin-authored posts"
      />

      <div className="flex-1 p-6">
        <Card className="border-none shadow-sm max-w-3xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="An engaging title for your blog"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <Label htmlFor="summary">
                  Summary{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="summary"
                  rows={2}
                  placeholder="A brief summary shown in listings (max 500 chars)"
                  className="resize-none"
                  {...form.register("summary")}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  rows={14}
                  placeholder="Write your blog post here…"
                  className="resize-y"
                  {...form.register("content")}
                />
                {form.formState.errors.content && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              {/* Cover image */}
              <ImageUpload
                label="Cover Image (optional)"
                value={form.watch("cover_image_url") ?? ""}
                onChange={(url) =>
                  form.setValue("cover_image_url", url, {
                    shouldValidate: true,
                  })
                }
                context="blog-covers"
              />
              {form.formState.errors.cover_image_url && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cover_image_url.message}
                </p>
              )}

              {/* Tags */}
              <div className="space-y-1.5">
                <Label>
                  Tags{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional, press Enter to add)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-background px-3 py-2 min-h-[2.5rem]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-accent-foreground/60 hover:text-accent-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder={
                      tags.length === 0 ? "college, admissions, tips…" : ""
                    }
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Publishing…" : "Publish Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
