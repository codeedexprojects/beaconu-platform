import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { videoTestimonialsService } from "@/lib/services/video-testimonials.service";
import type { Paginated } from "@/lib/api";
import type {
  VideoTestimonial,
  CreateVideoTestimonialInput,
  UpdateVideoTestimonialInput,
} from "@beaconu/types";

export function useVideoTestimonials(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) {
  return useQuery<Paginated<VideoTestimonial>>({
    queryKey: QUERY_KEYS.videoTestimonials(params),
    queryFn: () => videoTestimonialsService.list(params),
  });
}

export function useVideoTestimonial(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.videoTestimonial(id),
    queryFn: () => videoTestimonialsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVideoTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVideoTestimonialInput) =>
      videoTestimonialsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonials(),
      });
    },
  });
}

export function useUpdateVideoTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateVideoTestimonialInput;
    }) => videoTestimonialsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonials(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonial(id),
      });
    },
  });
}

export function useDeactivateVideoTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videoTestimonialsService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonials(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonial(id),
      });
    },
  });
}

export function useActivateVideoTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videoTestimonialsService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonials(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.videoTestimonial(id),
      });
    },
  });
}
