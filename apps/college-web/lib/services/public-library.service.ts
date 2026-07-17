import { cache } from "react";
import { api } from "@/lib/api";
import type { PublicLibrary } from "@beaconu/types";

export async function getLibraries(slug: string): Promise<PublicLibrary[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/libraries`);
}

// Cached: called from the [libraryId] layout AND page in the same render pass.
export const getLibraryDetail = cache(
  async (slug: string, libraryId: string): Promise<PublicLibrary> => {
    return api.get(
      `/api/v1/public/colleges/by-slug/${slug}/libraries/${libraryId}`,
    );
  },
);
