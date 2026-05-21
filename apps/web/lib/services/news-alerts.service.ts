import { cookies } from "next/headers";
import type {
  NewsAlertListItem,
  NewsAlert,
  PaginationMeta,
} from "@beaconu/types";
import { API_BASE, STUDENT_TOKEN_KEY } from "@/lib/constants";

export interface PaginatedNewsAlerts {
  data: NewsAlertListItem[];
  meta: PaginationMeta;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_TOKEN_KEY)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPublishedNewsAlerts(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedNewsAlerts> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 12));
  if (params.search) query.set("search", params.search);

  const res = await fetch(
    `${API_BASE}/api/v1/student/news?${query.toString()}`,
    { cache: "no-store", headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch news alerts");
  const body = await res.json();
  return { data: body.data ?? [], meta: body.meta };
}

export async function getPublishedNewsAlertBySlug(
  slug: string,
): Promise<NewsAlert> {
  const res = await fetch(`${API_BASE}/api/v1/student/news/${slug}`, {
    next: { revalidate: 60 },
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("News alert not found");
  const body = await res.json();
  return body.data;
}
