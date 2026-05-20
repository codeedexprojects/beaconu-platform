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

export async function getPublicCollegeBySlug(
  slug: string,
): Promise<PublicCollege> {
  return api.get<PublicCollege>(`/api/v1/public/colleges/by-slug/${slug}`, {
    skipAuth: true,
    suppress401Redirect: true,
  });
}
