import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getSidebarHints } from "@/lib/services/dashboard.service";

// Refetches periodically so badge counts stay reasonably fresh without a
// realtime push channel — this is a low-stakes "how many things need my
// attention" indicator, not a live feed.
export function useSidebarHints() {
  return useQuery({
    queryKey: QUERY_KEYS.sidebarHints,
    queryFn: getSidebarHints,
    refetchInterval: 60_000,
  });
}
