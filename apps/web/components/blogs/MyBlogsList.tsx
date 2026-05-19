"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Edit2,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useMyBlogs } from "@/hooks/use-blogs";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BlogHeader } from "@/components/blogs/BlogHeader";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

type StatusValue = (typeof STATUS_TABS)[number]["value"];

/* Status badge config — mirrors college type badges */
const STATUS_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
    label: "Pending",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    icon: XCircle,
    label: "Rejected",
  },
};

export function MyBlogsList() {
  const [activeStatus, setActiveStatus] = useState<StatusValue>("");

  const { data, isLoading, isError } = useMyBlogs({
    status: activeStatus || undefined,
  });

  const blogs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <BlogHeader
        backHref="/blogs"
        backLabel="Browse blogs"
        title="My Blogs"
        rightAction={
          <Link
            href="/my/blogs/new"
            aria-label="Write new blog"
            className="h-9 px-4 rounded-full bg-[#E8521A] hover:bg-[#D04718] active:scale-95 transition-all text-white text-[13px] font-semibold flex items-center gap-1.5"
          >
            <Plus size={15} aria-hidden />
            New Blog
          </Link>
        }
      >
        {/* Status tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-3 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {STATUS_TABS.map((tab) => {
            const active = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                aria-pressed={active}
                className={cn(
                  "shrink-0 h-[34px] px-4 rounded-full text-[13px] font-medium transition-all",
                  active
                    ? "bg-[#E8521A] text-white font-semibold border-0"
                    : "bg-white text-gray-600 border-[1.5px] border-gray-200 hover:border-gray-300",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </BlogHeader>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* ── Loading ── */}
        {isLoading && (
          <div
            className="flex items-center justify-center py-20"
            aria-label="Loading blogs"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#E8521A]" />
              <p className="text-[13px] text-gray-400">Loading your blogs…</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-500" />
            </div>
            <p className="text-[15px] font-bold text-gray-900">
              Failed to load blogs
            </p>
            <p className="text-[13px] text-gray-500 text-center">
              Something went wrong. Please refresh and try again.
            </p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !isError && blogs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] py-16 px-6 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF0EB] flex items-center justify-center">
              <FileText size={28} className="text-[#E8521A]" />
            </div>
            <p className="text-[15px] font-bold text-gray-900">
              {activeStatus ? `No ${activeStatus} blogs` : "No blogs yet"}
            </p>
            <p className="text-[13px] text-gray-400 text-center">
              {activeStatus
                ? `You don't have any ${activeStatus} posts right now.`
                : "Share your college story with students across India."}
            </p>
            {!activeStatus && (
              <Link
                href="/my/blogs/new"
                className="mt-1 h-11 px-6 rounded-full bg-[#E8521A] hover:bg-[#D04718] text-white text-[14px] font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus size={16} aria-hidden />
                Write your first blog
              </Link>
            )}
          </div>
        )}

        {/* ── Blog list ── */}
        {!isLoading && !isError && blogs.length > 0 && (
          <div className="flex flex-col gap-4">
            {blogs.map((blog) => {
              const sc = STATUS_CONFIG[blog.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              return (
                <article
                  key={blog.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                  <div className="p-4">
                    {/* Status badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          sc.bg,
                          sc.text,
                          sc.border,
                        )}
                        aria-label={`Status: ${sc.label}`}
                      >
                        <StatusIcon size={11} aria-hidden />
                        {sc.label}
                      </span>

                      {/* Edit button — only for pending */}
                      {blog.status === "pending" && (
                        <Link
                          href={`/my/blogs/${blog.id}/edit`}
                          aria-label={`Edit "${blog.title}"`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border-[1.5px] border-gray-200 bg-white text-[12px] font-semibold text-gray-600 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors"
                        >
                          <Edit2 size={12} aria-hidden />
                          Edit
                        </Link>
                      )}

                      {/* View button — only for approved */}
                      {blog.status === "approved" && blog.slug && (
                        <Link
                          href={`/blogs/${blog.slug}`}
                          aria-label={`View "${blog.title}"`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border-[1.5px] border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
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
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          View
                        </Link>
                      )}
                    </div>

                    {/* Blog title */}
                    <h2 className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">
                      {blog.title}
                    </h2>

                    {/* Rejection reason — inset card, mirrors course detail box */}
                    {blog.rejectionReason && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3">
                        <p className="text-[12px] font-semibold text-red-600 mb-0.5">
                          Rejection reason
                        </p>
                        <p className="text-[12px] text-red-500 leading-relaxed">
                          {blog.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="inline-flex items-center gap-1.5 text-[12px] text-gray-400">
                      <Calendar size={12} aria-hidden />
                      Submitted {formatDate(blog.createdAt)}
                    </p>
                  </div>

                  {/* CTA strip — mirrors "View Details →" button, only for approved */}
                  {blog.status === "approved" && blog.slug && (
                    <Link
                      href={`/blogs/${blog.slug}`}
                      aria-label={`Read "${blog.title}"`}
                      className="block w-full h-11 bg-[#E8521A] hover:bg-[#D04718] transition-colors flex items-center justify-center gap-2 text-white text-[13px] font-semibold"
                    >
                      Read Article
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
