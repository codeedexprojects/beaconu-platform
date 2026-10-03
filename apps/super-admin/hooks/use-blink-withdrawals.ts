import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getBlinkWithdrawalRequests,
  updateBlinkWithdrawalStatus,
  type BlinkWithdrawalFilters,
} from "@/lib/services/blink-withdrawals.service";
import type {
  UpdateBlinkWithdrawalStatusResult,
  UpdateWithdrawalStatusInput,
} from "@beaconu/types";

export function useBlinkWithdrawalRequests(
  filters: BlinkWithdrawalFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.blinkWithdrawalRequests(filters),
    queryFn: () => getBlinkWithdrawalRequests(filters),
  });
}

export function useUpdateBlinkWithdrawalStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateBlinkWithdrawalStatusResult,
    Error,
    { id: string; data: UpdateWithdrawalStatusInput }
  >({
    mutationFn: ({ id, data }) => updateBlinkWithdrawalStatus(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.blinkWithdrawalRequests(),
      });
    },
  });
}
