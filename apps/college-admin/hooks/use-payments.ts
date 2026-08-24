import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import {
  getOfflineReviewQueue,
  reviewOfflineTokenPayment,
  getFinanceOverview,
  getFinanceTransactions,
  type OfflineReviewQueueFilters,
  type ReviewOfflineTokenPaymentInput,
  type FinanceFilters,
  type FinanceTransactionsFilters,
} from "@/lib/services/payments.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useOfflineReviewQueue(filters: OfflineReviewQueueFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.offlineReviewQueue(filters),
    queryFn: () => getOfflineReviewQueue(filters),
  });
}

export function useReviewOfflineTokenPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ReviewOfflineTokenPaymentInput;
    }) => reviewOfflineTokenPayment(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["offline-review-queue"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useFinanceOverview(filters: FinanceFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.financeOverview(filters),
    queryFn: () => getFinanceOverview(filters),
  });
}

export function useFinanceTransactions(
  filters: FinanceTransactionsFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.financeTransactions(filters),
    queryFn: () => getFinanceTransactions(filters),
  });
}
