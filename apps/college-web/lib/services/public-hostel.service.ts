import { cache } from "react";
import { api } from "@/lib/api";
import type { PublicHostelSummary, PublicHostelDetail } from "@beaconu/types";

export async function getHostels(slug: string): Promise<PublicHostelSummary[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/hostels`);
}

// Cached: called from the [hostelId] layout AND page in the same render pass.
export const getHostelDetail = cache(
  async (slug: string, hostelId: string): Promise<PublicHostelDetail> => {
    return api.get(
      `/api/v1/public/colleges/by-slug/${slug}/hostels/${hostelId}`,
    );
  },
);
