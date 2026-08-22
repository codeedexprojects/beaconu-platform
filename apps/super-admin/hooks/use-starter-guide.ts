import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { starterGuideService } from "@/lib/services/starter-guide.service";
import type { Paginated } from "@/lib/api";
import type {
  StarterGuideListItem,
  CreateStarterGuideInput,
  UpdateStarterGuideInput,
} from "@beaconu/types";

export function useStarterGuides(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) {
  return useQuery<Paginated<StarterGuideListItem>>({
    queryKey: QUERY_KEYS.starterGuides(params),
    queryFn: () => starterGuideService.list(params),
  });
}

export function useStarterGuide(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.starterGuide(id),
    queryFn: () => starterGuideService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStarterGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStarterGuideInput) =>
      starterGuideService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuides(),
      });
    },
  });
}

export function useUpdateStarterGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStarterGuideInput }) =>
      starterGuideService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuides(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuide(id),
      });
    },
  });
}

export function useDeactivateStarterGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => starterGuideService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuides(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuide(id),
      });
    },
  });
}

export function useActivateStarterGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => starterGuideService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuides(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuide(id),
      });
    },
  });
}
