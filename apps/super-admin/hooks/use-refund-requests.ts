import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getRefundRequests,
  updateRefundStatus,
  type RefundRequestFilters,
  type UpdateRefundStatusResult,
} from "@/lib/services/refund-requests.service";
import type { UpdateRefundStatusInput } from "@beaconu/types";

export function useRefundRequests(filters: RefundRequestFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.refundRequests(filters),
    queryFn: () => getRefundRequests(filters),
  });
}

export function useUpdateRefundStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateRefundStatusResult,
    Error,
    { id: string; data: UpdateRefundStatusInput }
  >({
    mutationFn: ({ id, data }) => updateRefundStatus(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.refundRequests(),
      });
    },
  });
}
