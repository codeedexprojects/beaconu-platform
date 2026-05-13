import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAdminProfiles,
  getPendingBlinkUsers,
  type ProfileUser,
} from "@/lib/services/admins.service";

export type { ProfileUser };

export function useAdminProfiles() {
  const query = useQuery({
    queryKey: QUERY_KEYS.adminProfiles,
    queryFn: getAdminProfiles,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function usePendingBlinkUsers() {
  const query = useQuery<ProfileUser[]>({
    queryKey: QUERY_KEYS.pendingBlink,
    queryFn: getPendingBlinkUsers,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}
