import { api } from "@/lib/api";

export interface PublicCourseMaster {
  id: string;
  name: string;
  slug: string;
  studyLevel: { id: string; name: string; slug: string } | null;
  stream: { id: string; name: string; slug: string };
  discipline: { id: string; name: string; slug: string };
  programType: { id: string; name: string; slug: string } | null;
}

export async function getPublicCourses(
  search: string,
): Promise<PublicCourseMaster[]> {
  const params = new URLSearchParams({ limit: "20" });
  if (search.trim()) params.set("search", search.trim());

  return api.get<PublicCourseMaster[]>(
    `/api/v1/public/courses?${params.toString()}`,
    { skipAuth: true, suppress401Redirect: true },
  );
}
