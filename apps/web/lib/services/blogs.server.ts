import { cookies } from "next/headers";
import { API_BASE, STUDENT_TOKEN_KEY } from "@/lib/constants";
import type { Blog } from "./blogs.service";

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
