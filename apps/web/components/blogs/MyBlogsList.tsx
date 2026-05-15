"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, Calendar } from "lucide-react";
import { useMyBlogs } from "@/hooks/use-blogs";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

interface Props {
  userType: string;
}

export function MyBlogsList({ userType }: Props) {
  const [activeStatus, setActiveStatus] = useState("");

  const { data, isLoading } = useMyBlogs(userType, {
    status: activeStatus || undefined,
  });

  const blogs = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Blogs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track your submitted articles
          </p>
        </div>
        <Link
          href="/my/blogs/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Blog
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeStatus === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {activeStatus ? `No ${activeStatus} blogs` : "No blogs yet."}
          </p>
          {!activeStatus && (
            <Link
              href="/my/blogs/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Submit your first blog
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="rounded-xl border bg-card p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      STATUS_BADGE[blog.status],
                    )}
                  >
                    {blog.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {blog.title}
                </h3>
                {blog.rejectionReason && (
                  <p className="mt-1 text-xs text-red-600 line-clamp-1">
                    Reason: {blog.rejectionReason}
                  </p>
                )}
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Submitted {formatDate(blog.createdAt)}
                </p>
              </div>

              {blog.status === "pending" && (
                <Link
                  href={`/my/blogs/${blog.id}/edit`}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
