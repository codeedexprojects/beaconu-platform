import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCallRequests,
  getCallRequest,
  updateCallRequestStatus,
  type CallRequestListFilters,
} from "@/lib/services/call-requests.service";
import type { UpdateCallRequestStatusInput } from "@beaconu/types";

export function useCallRequests(filters: CallRequestListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.callRequests(filters),
    queryFn: () => getCallRequests(filters),
  });
}

export function useCallRequest(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.callRequest(id ?? ""),
    queryFn: () => getCallRequest(id as string),
    enabled: !!id,
  });
}

export function useUpdateCallRequestStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCallRequestStatusInput) =>
      updateCallRequestStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.callRequest(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.callRequests() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
