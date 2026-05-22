import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { API_BASE, STUDENT_TOKEN_KEY } from "@/lib/constants";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  authorId: string;
  authorType: string;
  authorName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitBlogInput {
  title: string;
  summary?: string;
  content: string;
  cover_image_url?: string;
  tags: string[];
}

export interface UpdateBlogInput {
  title?: string;
  summary?: string;
  content?: string;
  cover_image_url?: string;
  tags?: string[];
}

const BLOG_AUTHOR_BASE = "/api/v1/blog/author/blogs";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_TOKEN_KEY)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Student (auth required, used in Server Components with fetch) ──

export async function getPublicBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  data: Blog[];
  meta: { total: number; page: number; limit: number; hasNext: boolean };
}> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 12));
  if (params.search) query.set("search", params.search);

  const res = await fetch(
    `${API_BASE}/api/v1/student/blogs?${query.toString()}`,
    { cache: "no-store", headers: await getAuthHeaders() },
  );

  if (!res.ok) throw new Error("Failed to fetch blogs");
  const body = await res.json();
  return { data: body.data ?? [], meta: body.meta };
}

export async function getPublicBlogBySlug(slug: string): Promise<Blog> {
  const res = await fetch(`${API_BASE}/api/v1/student/blogs/${slug}`, {
    next: { revalidate: 60 },
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Blog not found");
  const body = await res.json();
  return body.data;
}

// ── Author (uses api client with Bearer token) ──

export const blogAuthorService = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 10));
    return api.get<Blog[]>(`${BLOG_AUTHOR_BASE}?${query.toString()}`);
  },

  getById: (id: string) => api.get<Blog>(`${BLOG_AUTHOR_BASE}/${id}`),

  submit: (data: SubmitBlogInput) => api.post<Blog>(BLOG_AUTHOR_BASE, data),

  update: (id: string, data: UpdateBlogInput) =>
    api.patch<Blog>(`${BLOG_AUTHOR_BASE}/${id}`, data),
};
