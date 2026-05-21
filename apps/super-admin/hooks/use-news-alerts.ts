import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { newsAlertsService } from "@/lib/services/news-alerts.service";
import type { Paginated } from "@/lib/api";
import type {
  NewsAlertListItem,
  CreateNewsAlertInput,
  UpdateNewsAlertInput,
} from "@beaconu/types";

export function useNewsAlerts(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<Paginated<NewsAlertListItem>>({
    queryKey: QUERY_KEYS.newsAlerts(params),
    queryFn: () => newsAlertsService.list(params),
  });
}

export function useNewsAlert(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.newsAlert(id),
    queryFn: () => newsAlertsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateNewsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNewsAlertInput) => newsAlertsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlerts() });
    },
  });
}

export function useUpdateNewsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsAlertInput }) =>
      newsAlertsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlerts() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.newsAlert(id),
      });
    },
  });
}

export function usePublishNewsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsAlertsService.publish(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlerts() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.newsAlert(id),
      });
    },
  });
}

export function useArchiveNewsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsAlertsService.archive(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlerts() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.newsAlert(id),
      });
    },
  });
}

export function useUnarchiveNewsAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsAlertsService.unarchive(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlerts() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.newsAlert(id),
      });
    },
  });
}
