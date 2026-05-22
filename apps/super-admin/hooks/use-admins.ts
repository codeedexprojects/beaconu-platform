import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAdminProfiles,
  getPendingBlinkUsers,
  type ProfileUser,
} from "@/lib/services/admins.service";

export type { ProfileUser };

export function useAdminProfiles() {
  return useQuery({
    queryKey: QUERY_KEYS.adminProfiles,
    queryFn: getAdminProfiles,
  });
}

export function usePendingBlinkUsers() {
  return useQuery<ProfileUser[]>({
    queryKey: QUERY_KEYS.pendingBlink,
    queryFn: getPendingBlinkUsers,
  });
}
