import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { BLOG_TOKEN_KEY, API_BASE } from "@/lib/constants";
import { BlogEditForm } from "@/components/blogs/BlogEditForm";
import type { Blog } from "@/lib/services/blogs.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(BLOG_TOKEN_KEY)?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${API_BASE}/api/v1/blog-author/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/my/blogs");

  const body = await res.json();
  const blog: Blog = body.data;

  if (blog.status !== "pending") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{blog.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This blog is no longer editable.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <span
              className={
                blog.status === "approved"
                  ? "inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700"
                  : "inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold capitalize text-red-700"
              }
            >
              {blog.status}
            </span>
          </div>
          {blog.rejectionReason && (
            <div>
              <p className="text-sm font-medium text-foreground">
                Rejection reason:
              </p>
              <p className="mt-0.5 text-sm text-red-600">
                {blog.rejectionReason}
              </p>
            </div>
          )}
          <Link
            href="/my/blogs"
            className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Back to My Blogs
          </Link>
        </div>
      </div>
    );
  }

  return <BlogEditForm blog={blog} userType="blog_author" />;
}
