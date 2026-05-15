"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useSubmitBlog } from "@/hooks/use-blogs";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "Content is required"),
  cover_image_url: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
      message: "Enter a valid URL",
    })
    .optional()
    .or(z.literal("")),
});

type FormInput = z.infer<typeof schema>;

interface Props {
  userType: string;
}

export function BlogSubmitForm({ userType }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { mutate, isPending } = useSubmitBlog(userType);

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
          toast.success("Blog submitted for review!");
          router.push("/my/blogs");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Blog Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your post will be reviewed before publishing.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="An engaging title for your blog"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <label className="text-sm font-medium text-foreground">
            Summary{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="A brief summary shown in listings (max 500 chars)"
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            {...form.register("summary")}
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Content <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={12}
            placeholder="Write your blog post here…"
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            {...form.register("content")}
          />
          {form.formState.errors.content && (
            <p className="text-xs text-destructive">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        {/* Cover image */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Cover Image URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register("cover_image_url")}
          />
          {form.formState.errors.cover_image_url && (
            <p className="text-xs text-destructive">
              {form.formState.errors.cover_image_url.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Tags{" "}
            <span className="text-muted-foreground font-normal">
              (optional, press Enter to add)
            </span>
          </label>
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
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Submitting…" : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
