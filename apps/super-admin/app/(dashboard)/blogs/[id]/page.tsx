"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Tag,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useAdminBlog,
  useApproveBlog,
  useRejectBlog,
  useUnpublishBlog,
} from "@/hooks/use-blogs";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, { badge: string; label: string }> = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending Review",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Approved",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Rejected",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: blog, isLoading } = useAdminBlog(id);
  const { mutate: approve, isPending: isApproving } = useApproveBlog();
  const { mutate: reject, isPending: isRejecting } = useRejectBlog();
  const { mutate: unpublish, isPending: isUnpublishing } = useUnpublishBlog();

  function handleApprove() {
    approve(id, {
      onSuccess: () => {
        toast.success("Blog approved and published!");
        router.push("/blogs");
      },
    });
  }

  function handleUnpublish() {
    unpublish(id, {
      onSuccess: () => {
        toast.success("Blog unpublished and moved back to pending review.");
      },
    });
  }

  function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    reject(
      { id, data: { rejection_reason: rejectionReason.trim() } },
      {
        onSuccess: () => {
          toast.success("Blog rejected.");
          router.push("/blogs");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Blog Detail" />
        <div className="flex-1 p-6 space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Blog Detail" />
        <div className="flex-1 p-6 text-center text-muted-foreground text-sm py-16">
          Blog not found.{" "}
          <Link href="/blogs" className="text-primary hover:underline">
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_VARIANT[blog.status];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Blog Detail" description={blog.title} />

      <div className="flex-1 p-6 space-y-5 max-w-4xl">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        {blog.status === "pending" && (
          <Card className="border-none shadow-sm border-l-4 border-l-amber-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Review this Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showRejectForm ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {isApproving ? "Approving…" : "Approve & Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isApproving || isRejecting}
                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reason">
                      Rejection Reason{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="reason"
                      rows={3}
                      placeholder="Explain why this post is being rejected…"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason("");
                      }}
                      disabled={isRejecting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isRejecting || !rejectionReason.trim()}
                      variant="destructive"
                      className="gap-2"
                    >
                      {isRejecting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isRejecting ? "Rejecting…" : "Confirm Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {blog.status !== "pending" && (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 flex items-center gap-3",
              blog.status === "approved"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200",
            )}
          >
            {blog.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {blog.status === "approved" ? "Published" : "Rejected"}
                {blog.reviewedAt && ` on ${formatDate(blog.reviewedAt)}`}
              </p>
              {blog.rejectionReason && (
                <p className="text-xs text-red-700 mt-0.5">
                  Reason: {blog.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Unpublish button — only for approved */}
        {blog.status === "approved" && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isUnpublishing}
              className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              {isUnpublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {isUnpublishing ? "Unpublishing…" : "Unpublish"}
            </Button>
          </div>
        )}

        {/* Blog content */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6 space-y-5">
            {/* Cover image */}
            {blog.coverImageUrl && (
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="w-full h-56 object-cover rounded-lg"
              />
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                  statusInfo.badge,
                )}
              >
                {statusInfo.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {blog.authorName}{" "}
                <span className="text-muted-foreground/60">
                  ({blog.authorType.replace("_", " ")})
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {blog.viewCount} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground">{blog.title}</h1>

            {/* Summary */}
            {blog.summary && (
              <p className="text-base text-muted-foreground italic border-l-2 border-border pl-4">
                {blog.summary}
              </p>
            )}

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {blog.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
