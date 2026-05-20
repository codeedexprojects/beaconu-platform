import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  universitiesService,
  type CreateUniversityInput,
  type UpdateUniversityInput,
} from "@/lib/services/universities.service";

export function useUniversities(filters?: {
  status?: string;
  university_type_id?: string;
  state?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.universities, filters],
    queryFn: () => universitiesService.getAll(filters),
  });
}

export function useUniversity(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.university(id),
    queryFn: () => universitiesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUniversityInput) =>
      universitiesService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.universities });
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUniversityInput }) =>
      universitiesService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.universities });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.university(id),
      });
    },
  });
}

export function useArchiveUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => universitiesService.archive(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.universities });
    },
  });
}
