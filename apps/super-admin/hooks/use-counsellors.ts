import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCounsellorDetail,
  getCounsellors,
} from "@/lib/services/counsellors.service";
import type { ListCounsellorsFilters } from "@beaconu/types";

export function useCounsellors(filters: ListCounsellorsFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellors(filters),
    queryFn: () => getCounsellors(filters),
  });
}

export function useCounsellorDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorDetail(id),
    queryFn: () => getCounsellorDetail(id),
    enabled: Boolean(id),
  });
}
