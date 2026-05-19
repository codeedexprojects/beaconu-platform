export const QUERY_KEYS = {
  publicBlogs: (page?: number, search?: string) =>
    ["public-blogs", page, search] as const,
  publicBlog: (slug: string) => ["public-blogs", slug] as const,
  myBlogs: (status?: string, page?: number) =>
    ["my-blogs", status, page] as const,
  myBlog: (id: string) => ["my-blogs", id] as const,
} as const;
