"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useUpdateBlog } from "@/hooks/use-blogs";
import type { Blog } from "@/lib/services/blogs.service";
import { BlogHeader } from "@/components/blogs/BlogHeader";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title too long"),
  summary: z
    .string()
    .trim()
    .max(500, "Summary must be 500 characters or less")
    .optional(),
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
  blog: Blog;
}

export function BlogEditForm({ blog }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(blog.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const { mutate, isPending } = useUpdateBlog(blog.id);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog.title,
      summary: blog.summary ?? "",
      content: blog.content,
      cover_image_url: blog.coverImageUrl ?? "",
    },
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
    const payload: Record<string, unknown> = {};
    if (data.title !== blog.title) payload.title = data.title;
    if ((data.summary || "") !== (blog.summary ?? ""))
      payload.summary = data.summary;
    if (data.content !== blog.content) payload.content = data.content;
    if ((data.cover_image_url || "") !== (blog.coverImageUrl ?? ""))
      payload.cover_image_url = data.cover_image_url || undefined;
    if (JSON.stringify(tags) !== JSON.stringify(blog.tags)) payload.tags = tags;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    mutate(payload, {
      onSuccess: () => {
        toast.success("Blog updated!");
        router.push("/my/blogs");
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <BlogHeader
        backHref="/my/blogs"
        backLabel="My blogs"
        title="Edit Blog Post"
      />

      <div className="max-w-2xl mx-auto px-4 py-5">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* ── Title ── */}
          <FormField
            label="Title"
            required
            error={form.formState.errors.title?.message}
          >
            <input
              type="text"
              aria-required="true"
              aria-invalid={!!form.formState.errors.title}
              className={inputClass(!!form.formState.errors.title)}
              {...form.register("title")}
            />
          </FormField>

          {/* ── Summary ── */}
          <FormField
            label="Summary"
            hint="optional · max 500 chars"
            error={form.formState.errors.summary?.message}
          >
            <textarea
              rows={2}
              aria-describedby={
                form.formState.errors.summary ? "summary-error" : undefined
              }
              className={`${inputClass(!!form.formState.errors.summary)} resize-none`}
              {...form.register("summary")}
            />
          </FormField>

          {/* ── Content ── */}
          <FormField
            label="Content"
            required
            error={form.formState.errors.content?.message}
          >
            <textarea
              rows={10}
              aria-required="true"
              aria-invalid={!!form.formState.errors.content}
              className={`${inputClass(!!form.formState.errors.content)} resize-y min-h-[180px]`}
              {...form.register("content")}
            />
          </FormField>

          {/* ── Cover image URL ── */}
          <FormField
            label="Cover Image URL"
            hint="optional"
            error={form.formState.errors.cover_image_url?.message}
          >
            <input
              type="url"
              className={inputClass(!!form.formState.errors.cover_image_url)}
              {...form.register("cover_image_url")}
            />
          </FormField>

          {/* ── Tags ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[13px] font-semibold text-gray-800">
                Tags
              </label>
              <span className="text-[11px] text-gray-400">
                press Enter to add · max 10
              </span>
            </div>
            <div
              className="flex flex-wrap gap-1.5 min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-[#E8521A] transition-colors"
              aria-label="Tags"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF0EB] text-[#C04010] text-[11px] font-semibold border border-[#E8521A]/15"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="text-[#E8521A]/60 hover:text-[#E8521A] transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Add tags…" : ""}
                aria-label="Add a tag"
                className="flex-1 min-w-[120px] bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-1 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-12 flex-1 rounded-full border-[1.5px] border-gray-200 bg-white text-[14px] font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-12 flex-[2] rounded-full bg-[#E8521A] hover:bg-[#D04718] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none transition-all text-white text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Save Changes
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────────────── */
function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-900",
    "placeholder:text-gray-400 outline-none transition-colors",
    "focus:border-[#E8521A] focus:bg-white",
    hasError ? "border-red-400 bg-red-50/30" : "border-gray-200",
  ].join(" ");
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[13px] font-semibold text-gray-800">
          {label}
          {required && <span className="text-[#E8521A] ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
