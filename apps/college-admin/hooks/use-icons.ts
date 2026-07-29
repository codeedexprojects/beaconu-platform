import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { iconsService } from "@/lib/services/icons.service";

export function useIcons(search?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.icons(search),
    queryFn: () => iconsService.getActive(search),
  });
}
