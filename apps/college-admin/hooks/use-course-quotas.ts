import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCourseQuotas,
  attachCourseQuota,
  updateCourseQuota,
  detachCourseQuota,
  type AttachCourseQuotaInput,
  type UpdateCourseQuotaInput,
} from "@/lib/services/colleges.service";

export function useCourseQuotas(courseId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courseQuotas(courseId ?? ""),
    queryFn: () => getCourseQuotas(courseId as string),
    enabled: !!courseId,
  });
}

export function useAttachCourseQuota(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttachCourseQuotaInput) =>
      attachCourseQuota(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotas(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCourseQuota(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseQuotaId,
      data,
    }: {
      courseQuotaId: string;
      data: UpdateCourseQuotaInput;
    }) => updateCourseQuota(courseId, courseQuotaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotas(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDetachCourseQuota(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseQuotaId: string) =>
      detachCourseQuota(courseId, courseQuotaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotas(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
