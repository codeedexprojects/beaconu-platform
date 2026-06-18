import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getWithdrawalRequests,
  updateWithdrawalStatus,
  type WithdrawalRequestFilters,
  type UpdateWithdrawalStatusResult,
} from "@/lib/services/withdrawal-requests.service";
import type { UpdateWithdrawalStatusInput } from "@beaconu/types";

export function useWithdrawalRequests(filters: WithdrawalRequestFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.withdrawalRequests(filters),
    queryFn: () => getWithdrawalRequests(filters),
  });
}

export function useUpdateWithdrawalStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateWithdrawalStatusResult,
    Error,
    { id: string; data: UpdateWithdrawalStatusInput }
  >({
    mutationFn: ({ id, data }) => updateWithdrawalStatus(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.withdrawalRequests(),
      });
    },
  });
}
