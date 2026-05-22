export const QUERY_KEYS = {
  publicBlogs: (page?: number, search?: string) =>
    ["public-blogs", page, search] as const,
  publicBlog: (slug: string) => ["public-blogs", slug] as const,
  myBlogs: (status?: string, page?: number) =>
    ["my-blogs", status, page] as const,
  myBlog: (id: string) => ["my-blogs", id] as const,
  newsAlerts: (params?: object) =>
    params ? ["news-alerts", params] : (["news-alerts"] as const),
  newsAlert: (slug: string) => ["news-alerts", slug] as const,
  entranceExams: (params?: object) =>
    params ? ["entrance-exams", params] : (["entrance-exams"] as const),
  entranceExam: (id: string) => ["entrance-exams", id] as const,
} as const;
