import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getRedemptionRequests,
  getRedemptionPayoutDetails,
  reviewRedemption,
  type RedemptionFilters,
} from "@/lib/services/student-redemptions.service";
import type {
  ReviewRedemptionInput,
  ReviewRedemptionResult,
} from "@beaconu/types";

export function useStudentRedemptions(filters: RedemptionFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentRedemptions(filters),
    queryFn: () => getRedemptionRequests(filters),
  });
}

/** Enabled only when a request is opened — this call decrypts server-side. */
export function useRedemptionPayoutDetails(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.studentRedemptionPayout(id ?? ""),
    queryFn: () => getRedemptionPayoutDetails(id!),
    enabled: id !== null,
  });
}

export function useReviewRedemption() {
  const queryClient = useQueryClient();
  return useMutation<
    ReviewRedemptionResult,
    Error,
    { id: string; data: ReviewRedemptionInput }
  >({
    mutationFn: ({ id, data }) => reviewRedemption(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studentRedemptions(),
      });
    },
  });
}
