import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAntiRaggingComplaints,
  getAntiRaggingComplaint,
  acknowledgeComplaint,
  startInvestigationComplaint,
  resolveComplaint,
  type AntiRaggingListFilters,
} from "@/lib/services/anti-ragging.service";
import type { ResolveComplaintInput } from "@beaconu/types";

export function useAntiRaggingComplaints(filters: AntiRaggingListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.antiRaggingComplaints(filters),
    queryFn: () => getAntiRaggingComplaints(filters),
  });
}

export function useAntiRaggingComplaint(complaintId: string | null) {
  return useQuery({
    queryKey: ["college-anti-ragging-complaint", complaintId],
    queryFn: () => getAntiRaggingComplaint(complaintId as string),
    enabled: !!complaintId,
  });
}

export function useAcknowledgeComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complaintId: string) => acknowledgeComplaint(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaints"],
      });
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaint"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useStartInvestigationComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complaintId: string) =>
      startInvestigationComplaint(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaints"],
      });
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaint"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResolveComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintId,
      data,
    }: {
      complaintId: string;
      data: ResolveComplaintInput;
    }) => resolveComplaint(complaintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaints"],
      });
      queryClient.invalidateQueries({
        queryKey: ["college-anti-ragging-complaint"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
