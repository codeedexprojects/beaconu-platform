import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { feedService } from "@/lib/services/feed.service";
import type { Paginated } from "@/lib/api";
import type { Feed, CreateFeedInput, UpdateFeedInput } from "@beaconu/types";

export function useFeedItems(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) {
  return useQuery<Paginated<Feed>>({
    queryKey: QUERY_KEYS.feedItems(params),
    queryFn: () => feedService.list(params),
  });
}

export function useFeedItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.feedItem(id),
    queryFn: () => feedService.getById(id),
    enabled: !!id,
  });
}

export function useCreateFeedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeedInput) => feedService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItems() });
    },
  });
}

export function useUpdateFeedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedInput }) =>
      feedService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItems() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItem(id) });
    },
  });
}

export function useDeactivateFeedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItems() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItem(id) });
    },
  });
}

export function useActivateFeedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItems() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedItem(id) });
    },
  });
}
