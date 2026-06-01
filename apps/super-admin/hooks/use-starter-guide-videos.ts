import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { starterGuideVideosService } from "@/lib/services/starter-guide-videos.service";
import type { Paginated } from "@/lib/api";
import type {
  StarterGuideVideoListItem,
  CreateStarterGuideVideoInput,
  UpdateStarterGuideVideoInput,
  PresignStarterGuideVideoUploadInput,
} from "@beaconu/types";

export function useStarterGuideVideos(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) {
  return useQuery<Paginated<StarterGuideVideoListItem>>({
    queryKey: QUERY_KEYS.starterGuideVideos(params),
    queryFn: () => starterGuideVideosService.list(params),
  });
}

export function useStarterGuideVideo(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.starterGuideVideo(id),
    queryFn: () => starterGuideVideosService.getById(id),
    enabled: !!id,
  });
}

export function usePresignStarterGuideVideoUpload() {
  return useMutation({
    mutationFn: (data: PresignStarterGuideVideoUploadInput) =>
      starterGuideVideosService.presignUpload(data),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateStarterGuideVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStarterGuideVideoInput) =>
      starterGuideVideosService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideos(),
      });
    },
  });
}

export function useUpdateStarterGuideVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStarterGuideVideoInput;
    }) => starterGuideVideosService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideos(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideo(id),
      });
    },
  });
}

export function useDeactivateStarterGuideVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => starterGuideVideosService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideos(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideo(id),
      });
    },
  });
}

export function useActivateStarterGuideVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => starterGuideVideosService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideos(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.starterGuideVideo(id),
      });
    },
  });
}
