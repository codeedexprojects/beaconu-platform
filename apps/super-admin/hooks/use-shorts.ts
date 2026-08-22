import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { shortsService } from "@/lib/services/shorts.service";
import type { Paginated } from "@/lib/api";
import type { Short, CreateShortInput, UpdateShortInput } from "@beaconu/types";

export function useShorts(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) {
  return useQuery<Paginated<Short>>({
    queryKey: QUERY_KEYS.shorts(params),
    queryFn: () => shortsService.list(params),
  });
}

export function useShort(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.short(id),
    queryFn: () => shortsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShortInput) => shortsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shorts() });
    },
  });
}

export function useUpdateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShortInput }) =>
      shortsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shorts() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.short(id) });
    },
  });
}

export function useDeactivateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shortsService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shorts() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.short(id) });
    },
  });
}

export function useActivateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shortsService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shorts() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.short(id) });
    },
  });
}
