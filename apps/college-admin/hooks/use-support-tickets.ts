import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeTickets,
  getCollegeTicket,
  replyToTicket,
  updateTicketStatus,
  type TicketListFilters,
} from "@/lib/services/support.service";
import type {
  SendTicketMessageInput,
  UpdateTicketStatusInput,
} from "@beaconu/types";

export function useCollegeTickets(filters: TicketListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.supportTickets(filters),
    queryFn: () => getCollegeTickets(filters),
  });
}

export function useCollegeTicket(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.supportTicket(id ?? ""),
    queryFn: () => getCollegeTicket(id as string),
    enabled: !!id,
  });
}

export function useReplyToTicket(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendTicketMessageInput) => replyToTicket(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTicket(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTickets() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTicketStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTicketStatusInput) =>
      updateTicketStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTicket(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTickets() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
