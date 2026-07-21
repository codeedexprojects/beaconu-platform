import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getMediaKits,
  createMediaKit,
  updateMediaKit,
  deleteMediaKit,
} from "@/lib/services/media-kit.service";
import type {
  CreateMediaKitInput,
  MediaKitListFilters,
  UpdateMediaKitInput,
} from "@beaconu/types";

export function useMediaKits(filters?: MediaKitListFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.mediaKits(filters),
    queryFn: () => getMediaKits(filters),
  });
}

export function useCreateMediaKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMediaKitInput) => createMediaKit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaKits() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateMediaKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaKitInput }) =>
      updateMediaKit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaKits() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteMediaKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaKit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaKits() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
