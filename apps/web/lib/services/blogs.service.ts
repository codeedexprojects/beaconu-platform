import { api } from "@/lib/api";

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
