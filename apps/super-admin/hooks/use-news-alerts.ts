import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  newsAlertsService,
  type PaginatedNewsAlerts,
} from "@/lib/services/news-alerts.service";
import type { CreateNewsAlertInput, UpdateNewsAlertInput } from "@beaconu/types";

export function useNewsAlerts(params?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = useQuery<PaginatedNewsAlerts>({
    queryKey: QUERY_KEYS.newsAlerts(params),
    queryFn: () => newsAlertsService.list(params),
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useNewsAlert(id: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.newsAlert(id),
    queryFn: () => newsAlertsService.getById(id),
    enabled: !!id,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlert(id) });
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlert(id) });
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newsAlert(id) });
    },
  });
}
