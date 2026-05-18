import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { BLOG_TOKEN_KEY, API_BASE } from "@/lib/constants";
import { BlogEditForm } from "@/components/blogs/BlogEditForm";
import { BlogHeader } from "@/components/blogs/BlogHeader";
import type { Blog } from "@/lib/services/blogs.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(BLOG_TOKEN_KEY)?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${API_BASE}/api/v1/blog/author/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/my/blogs");

  const body = await res.json();
  const blog: Blog = body.data;

  /* ── Non-editable state ── */
  if (blog.status !== "pending") {
    const isApproved = blog.status === "approved";

    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <BlogHeader
          backHref="/my/blogs"
          backLabel="My blogs"
          title="Blog Details"
        />

        <div className="max-w-2xl mx-auto px-4 py-5">
          {/* Blog title card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 mb-4">
            <h1 className="text-[20px] font-bold text-gray-900 leading-snug mb-1">
              {blog.title}
            </h1>
            {blog.summary && (
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {blog.summary}
              </p>
            )}
          </div>

          {/* Status info card — mirrors the course-detail inset box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden mb-5">
            <div className="p-5 space-y-4">
              {/* Status row */}
              <div className="flex items-center gap-3">
                {/* Status icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isApproved ? "bg-emerald-50" : "bg-red-50"
                  }`}
                >
                  {isApproved ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold border capitalize ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              </div>

              {/* Not-editable notice */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-[13px] font-semibold text-gray-800 mb-0.5">
                  {isApproved ? "Blog is live" : "Blog cannot be edited"}
                </p>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  {isApproved
                    ? "This blog has been approved and is publicly visible. It can no longer be edited."
                    : "This blog was rejected. You can submit a new blog post to try again."}
                </p>
              </div>

              {/* Rejection reason */}
              {blog.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-[12px] font-semibold text-red-600 mb-1">
                    Rejection reason
                  </p>
                  <p className="text-[13px] text-red-500 leading-relaxed">
                    {blog.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* CTA strip — same orange pill pattern */}
            <Link
              href={isApproved ? `/blogs/${blog.slug}` : "/my/blogs/new"}
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#E8521A] hover:bg-[#D04718] transition-colors text-white text-[14px] font-semibold"
            >
              {isApproved ? (
                <>
                  Read Article
                  <svg
                    width="15"
                    height="15"
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
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Write a New Blog
                </>
              )}
            </Link>
          </div>

          {/* Back link */}
          <Link
            href="/my/blogs"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-full border-[1.5px] border-gray-200 bg-white hover:border-gray-300 text-[14px] font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to My Blogs
          </Link>
        </div>
      </div>
    );
  }

  /* ── Editable: delegate to form component ── */
  return <BlogEditForm blog={blog} userType="blog_author" />;
}
