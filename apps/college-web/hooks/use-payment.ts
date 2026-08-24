import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import {
  confirmTokenPayment,
  getOfflineTokenPaymentStatus,
  initiateTokenPayment,
  resubmitOfflineTokenPayment,
  submitOfflineTokenPayment,
} from "@/lib/services/payment.service";
import type { OfflineTokenPaymentInput } from "@/lib/services/payment.service";

// Same mock-provider caveat as usePayApplicationFee (use-application.ts) — the
// backend has no real payment gateway wired up yet (mock provider always
// succeeds), so this chains initiate+confirm automatically instead of
// opening a real checkout between the two calls.
export function usePayTokenOnline(
  applicationId: string,
  applicationCourseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const order = await initiateTokenPayment(applicationCourseId);
      if (order.status === "completed") return order;
      return confirmTokenPayment(applicationCourseId, {
        transaction_id: order.id,
        provider_payment_id: order.providerOrderId ?? order.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useOfflineTokenPaymentStatus(
  applicationCourseId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.offlineTokenPaymentStatus(applicationCourseId),
    queryFn: () => getOfflineTokenPaymentStatus(applicationCourseId),
    enabled,
  });
}

export function useSubmitOfflineTokenPayment(
  applicationId: string,
  applicationCourseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfflineTokenPaymentInput) =>
      submitOfflineTokenPayment(applicationCourseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.offlineTokenPaymentStatus(applicationCourseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResubmitOfflineTokenPayment(
  applicationId: string,
  applicationCourseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfflineTokenPaymentInput) =>
      resubmitOfflineTokenPayment(applicationCourseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.offlineTokenPaymentStatus(applicationCourseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
