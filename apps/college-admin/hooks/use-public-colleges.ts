import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPublicCollegeBySlug,
  getPublicColleges,
} from "@/lib/services/public-colleges.service";

export function usePublicColleges(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.publicColleges,
    queryFn: getPublicColleges,
    enabled,
    retry: false,
  });
}

export function usePublicCollegeBySlug(slug: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.publicCollegeBySlug(slug ?? "missing"),
    queryFn: () => getPublicCollegeBySlug(slug as string),
    enabled: Boolean(slug),
    retry: false,
  });
}
