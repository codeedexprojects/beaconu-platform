import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPlatformTickets,
  getPlatformTicket,
  createPlatformTicket,
  replyToPlatformTicket,
  type PlatformTicketListFilters,
} from "@/lib/services/platform-tickets.service";
import type {
  CreatePlatformTicketInput,
  SendPlatformTicketMessageInput,
} from "@beaconu/types";

export function usePlatformTickets(filters: PlatformTicketListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.platformTickets(filters),
    queryFn: () => getPlatformTickets(filters),
  });
}

export function usePlatformTicket(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.platformTicket(id ?? ""),
    queryFn: () => getPlatformTicket(id as string),
    enabled: !!id,
  });
}

export function useCreatePlatformTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformTicketInput) =>
      createPlatformTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.platformTickets() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useReplyToPlatformTicket(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendPlatformTicketMessageInput) =>
      replyToPlatformTicket(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformTicket(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformTickets(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
