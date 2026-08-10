import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import {
  createTicket,
  getTicketDetail,
  listMyTickets,
  sendTicketMessage,
} from "@/lib/services/ticket.service";
import type {
  CreateTicketInput,
  SendTicketMessageInput,
  TicketStatus,
} from "@beaconu/types";

export function useMyTickets(
  filters: { status?: TicketStatus; search?: string } = {},
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.myTickets(filters),
    queryFn: () => listMyTickets({ ...filters, limit: 50 }),
    enabled,
  });
}

export function useTicketDetail(ticketId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.ticketDetail(ticketId ?? ""),
    queryFn: () => getTicketDetail(ticketId as string),
    enabled: enabled && !!ticketId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myTickets() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSendTicketMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendTicketMessageInput) =>
      sendTicketMessage(ticketId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ticketDetail(ticketId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myTickets() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
