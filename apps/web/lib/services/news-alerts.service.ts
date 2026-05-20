import type { NewsAlertListItem, NewsAlert, PaginationMeta } from "@beaconu/types";
import { API_BASE } from "@/lib/constants";

export interface PaginatedNewsAlerts {
  data: NewsAlertListItem[];
  meta: PaginationMeta;
}

export async function getPublishedNewsAlerts(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<PaginatedNewsAlerts> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 12));
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);

  const res = await fetch(
    `${API_BASE}/api/v1/public/news?${query.toString()}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error("Failed to fetch news alerts");
  const body = await res.json();
  return { data: body.data ?? [], meta: body.meta };
}

export async function getPublishedNewsAlertBySlug(
  slug: string,
): Promise<NewsAlert> {
  const res = await fetch(`${API_BASE}/api/v1/public/news/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("News alert not found");
  const body = await res.json();
  return body.data;
}
