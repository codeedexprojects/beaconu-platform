import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCounsellorDetail,
  getCounsellors,
  getCounsellorSessions,
  getCounsellorSlots,
  getCounsellorWalletTransactions,
  type PageQuery,
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

export function useCounsellorWalletTransactions(
  id: string,
  query: PageQuery = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorWalletTransactions(id, query),
    queryFn: () => getCounsellorWalletTransactions(id, query),
    enabled: Boolean(id),
  });
}

export function useCounsellorSlots(
  id: string,
  status: "available" | "booked",
  query: PageQuery = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorSlots(id, status, query),
    queryFn: () => getCounsellorSlots(id, status, query),
    enabled: Boolean(id),
  });
}

export function useCounsellorSessions(id: string, query: PageQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorSessions(id, query),
    queryFn: () => getCounsellorSessions(id, query),
    enabled: Boolean(id),
  });
}
