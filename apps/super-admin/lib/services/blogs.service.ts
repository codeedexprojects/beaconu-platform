import { api } from "../api";

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

export interface PaginatedBlogs {
  data: Blog[];
  meta: { total: number; page: number; limit: number; hasNext: boolean };
}

export interface SubmitBlogInput {
  title: string;
  summary?: string;
  content: string;
  cover_image_url?: string;
  tags: string[];
}

export interface RejectBlogInput {
  rejection_reason: string;
}

export const adminBlogsService = {
  list: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 10));
    return api.get<PaginatedBlogs>(`/api/v1/admin/blogs?${query.toString()}`);
  },

  getById: (id: string) => api.get<Blog>(`/api/v1/admin/blogs/${id}`),

  approve: (id: string) =>
    api.patch<Blog>(`/api/v1/admin/blogs/${id}/approve`, {}),

  reject: (id: string, data: RejectBlogInput) =>
    api.patch<Blog>(`/api/v1/admin/blogs/${id}/reject`, data),

  submit: (data: SubmitBlogInput) =>
    api.post<Blog>("/api/v1/admin/blogs", data),
};
