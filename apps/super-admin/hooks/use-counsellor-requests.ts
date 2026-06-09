import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCounsellorRequestById,
  getCounsellorRequests,
  updateCounsellorRequestStatus,
  type CounsellorRequestFilters,
} from "@/lib/services/counsellor-requests.service";
import type {
  UpdateCounsellorRequestStatusInput,
  UpdateCounsellorRequestStatusResult,
} from "@beaconu/types";

export function useCounsellorRequests(filters: CounsellorRequestFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorRequests(filters),
    queryFn: () => getCounsellorRequests(filters),
  });
}

export function useCounsellorRequest(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.counsellorRequest(id),
    queryFn: () => getCounsellorRequestById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateCounsellorRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateCounsellorRequestStatusResult,
    Error,
    { id: string; data: UpdateCounsellorRequestStatusInput }
  >({
    mutationFn: ({ id, data }) => updateCounsellorRequestStatus(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.counsellorRequests(),
      });
    },
  });
}
