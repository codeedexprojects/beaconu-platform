import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getSeatCancellations,
  reviewSeatCancellation,
  type SeatCancellationListFilters,
} from "@/lib/services/seat-cancellations.service";
import type { ReviewSeatCancellationInput } from "@beaconu/types";

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
