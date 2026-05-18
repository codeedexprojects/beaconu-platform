import { api } from "@/lib/api";

export interface PublicCollege {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string | null;
  university?: {
    id: string;
    name: string;
    type: string;
    logoUrl?: string | null;
  } | null;
}

export const publicCollegesService = {
  getBySlug(slug: string) {
    return api.get<PublicCollege>(`/api/v1/public/colleges/by-slug/${slug}`);
  },
};
