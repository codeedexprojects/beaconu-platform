import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { eventsService } from "@/lib/services/events.service";
import type { Paginated } from "@/lib/api";
import type {
  EventListItem,
  CreateEventInput,
  UpdateEventInput,
  UploadRecordingInput,
} from "@beaconu/types";

export function useEvents(params?: {
  status?: string;
  category?: string;
  event_mode?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<Paginated<EventListItem>>({
    queryKey: QUERY_KEYS.events(params),
    queryFn: () => eventsService.list(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.event(id),
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) => eventsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      eventsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event(id),
      });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      eventsService.updateStatus(id, status),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event(id),
      });
    },
  });
}

export function useSoftDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.softDelete(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events() });
    },
  });
}

export function useUploadRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UploadRecordingInput }) =>
      eventsService.uploadRecording(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event(id),
      });
    },
  });
}

export function useEventRegistrations(
  eventId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: QUERY_KEYS.eventRegistrations(eventId, params),
    queryFn: () => eventsService.listRegistrations(eventId, params),
    enabled: !!eventId,
  });
}
