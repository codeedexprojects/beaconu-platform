import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { getPublicCollegeBySlug } from "@/lib/services/public-colleges.service";

export function usePublicCollegeBySlug(slug: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.publicCollegeBySlug(slug ?? "missing"),
    queryFn: () => getPublicCollegeBySlug(slug as string),
    enabled: Boolean(slug),
    retry: false,
  });
}
