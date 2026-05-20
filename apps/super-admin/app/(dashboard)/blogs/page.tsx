"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useAdminBlogs } from "@/hooks/use-blogs";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogsPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useAdminBlogs({
    status: activeStatus || undefined,
    search: search || undefined,
  });

  const blogs = data?.data ?? [];
  const meta = data?.meta;

  console.log(blogs);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Blogs"
        description="Review and manage blog posts submitted for publishing"
      >
        <Link href="/blogs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-background"
            />
          </form>
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

        {/* Table */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {activeStatus
                  ? `No ${activeStatus} blogs found.`
                  : "No blogs yet."}
              </div>
            ) : (
              <div className="divide-y">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.id}`}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                            STATUS_BADGE[blog.status],
                          )}
                        >
                          {blog.status}
                        </span>
                        {blog.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {blog.title}
                      </p>
                      {blog.summary && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {blog.summary}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {blog.authorName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(blog.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {blog.viewCount} views
                        </span>
                      </div>
                    </div>

                    {blog.status === "pending" && (
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          Review
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {blog.status === "approved" && (
                      <CheckCircle2 className="shrink-0 h-4 w-4 text-emerald-600 mt-1" />
                    )}
                    {blog.status === "rejected" && (
                      <XCircle className="shrink-0 h-4 w-4 text-red-500 mt-1" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {blogs.length} of {meta.total} posts
          </p>
        )}
      </div>
    </div>
  );
}
