import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getPublicCourses } from "@/lib/services/public-courses.service";

export function usePublicCourses(search: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publicCourses(search),
    queryFn: () => getPublicCourses(search),
    enabled: search.trim().length >= 2,
    staleTime: 60_000,
  });
}
