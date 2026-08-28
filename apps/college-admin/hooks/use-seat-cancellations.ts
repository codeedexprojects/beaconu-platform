import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getSeatCancellations,
  getSeatCancellationCase,
  reviewSeatCancellation,
  submitSeatCancellationInitiation,
  scheduleSeatCancellationCounseling,
  submitSeatCancellationCounselingOutcome,
  submitSeatCancellationSettlement,
  finalizeSeatCancellationClearance,
  type SeatCancellationListFilters,
} from "@/lib/services/seat-cancellations.service";
import type {
  FinalizeSeatCancellationClearanceInput,
  ReviewSeatCancellationInput,
  ScheduleSeatCancellationCounselingInput,
  SubmitSeatCancellationCounselingOutcomeInput,
  SubmitSeatCancellationInitiationInput,
  SubmitSeatCancellationSettlementInput,
} from "@beaconu/types";

export function useSeatCancellations(
  filters: SeatCancellationListFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.seatCancellations(filters),
    queryFn: () => getSeatCancellations(filters),
  });
}

export function useReviewSeatCancellation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReviewSeatCancellationInput;
    }) => reviewSeatCancellation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatCancellations(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSeatCancellationCase(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.seatCancellationCase(id ?? ""),
    queryFn: () => getSeatCancellationCase(id as string),
    enabled: !!id,
  });
}

function useCaseMutation<TInput>(
  id: string,
  mutationFn: (id: string, data: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TInput) => mutationFn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatCancellationCase(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatCancellations(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSubmitSeatCancellationInitiation(id: string) {
  return useCaseMutation<SubmitSeatCancellationInitiationInput>(
    id,
    submitSeatCancellationInitiation,
  );
}

export function useScheduleSeatCancellationCounseling(id: string) {
  return useCaseMutation<ScheduleSeatCancellationCounselingInput>(
    id,
    scheduleSeatCancellationCounseling,
  );
}

export function useSubmitSeatCancellationCounselingOutcome(id: string) {
  return useCaseMutation<SubmitSeatCancellationCounselingOutcomeInput>(
    id,
    submitSeatCancellationCounselingOutcome,
  );
}

export function useSubmitSeatCancellationSettlement(id: string) {
  return useCaseMutation<SubmitSeatCancellationSettlementInput>(
    id,
    submitSeatCancellationSettlement,
  );
}

export function useFinalizeSeatCancellationClearance(id: string) {
  return useCaseMutation<FinalizeSeatCancellationClearanceInput>(
    id,
    finalizeSeatCancellationClearance,
  );
}
