import type { MetadataRoute } from "next";
import type { Blog } from "@/lib/services/blogs.service";
import { API_BASE } from "@/lib/constants";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: "https://beaconu.com",
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: "https://beaconu.com/blogs",
    changeFrequency: "daily",
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/blogs?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const body = await res.json();
    const blogs: Blog[] = body.data?.data ?? body.data ?? [];

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `https://beaconu.com/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...STATIC_ROUTES, ...blogRoutes];
  } catch {
    return STATIC_ROUTES;
  }
}
