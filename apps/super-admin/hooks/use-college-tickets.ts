import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  collegeTicketsService,
  type CollegeTicketListFilters,
} from "@/lib/services/college-tickets.service";
import type {
  SendPlatformTicketMessageInput,
  UpdatePlatformTicketStatusInput,
} from "@beaconu/types";

export function useCollegeTickets(filters: CollegeTicketListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.collegeTickets(filters),
    queryFn: () => collegeTicketsService.list(filters),
  });
}

export function useCollegeTicket(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.collegeTicket(id ?? ""),
    queryFn: () => collegeTicketsService.getById(id as string),
    enabled: !!id,
  });
}

export function useReplyToCollegeTicket(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendPlatformTicketMessageInput) =>
      collegeTicketsService.reply(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeTicket(id),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeTickets(),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCollegeTicketStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePlatformTicketStatusInput) =>
      collegeTicketsService.updateStatus(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeTicket(id),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeTickets(),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
