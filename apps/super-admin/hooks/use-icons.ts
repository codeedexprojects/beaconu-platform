import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { iconsService } from "@/lib/services/icons.service";
import type { CreateIconInput, UpdateIconInput } from "@beaconu/types";

export function useIcons(filters?: {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.icons(filters),
    queryFn: () => iconsService.getAll(filters),
  });
}

export function useIcon(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.icon(id),
    queryFn: () => iconsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIconInput) => iconsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icons() });
    },
  });
}

export function useUpdateIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIconInput }) =>
      iconsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icons() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icon(id) });
    },
  });
}

export function useDeactivateIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => iconsService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icons() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icon(id) });
    },
  });
}

export function useActivateIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => iconsService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icons() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.icon(id) });
    },
  });
}
