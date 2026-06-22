import type { HostelDetailDto, HostelSummaryDto } from "@beaconu/types";

// Server-safe fetch — no auth store, no localStorage, works in RSC.
const SERVER_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed: ${res.status}`,
    );
  }

  const body = await res.json();
  return (body as { data: T }).data;
}

export const hostelsService = {
  list: (collegeSlug: string) =>
    publicFetch<HostelSummaryDto[]>(
      `/api/v1/public/colleges/by-slug/${collegeSlug}/hostels`,
    ),

  getById: (collegeSlug: string, hostelId: string) =>
    publicFetch<HostelDetailDto>(
      `/api/v1/public/colleges/by-slug/${collegeSlug}/hostels/${hostelId}`,
    ),
};
