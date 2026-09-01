import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getApplications,
  getApplicationById,
  enrollApplicationCourse,
  rejectApplicationCourse,
  getPendingEnrollments,
  getPendingShortlist,
  getPendingShortlistDetail,
  type ApplicationListFilters,
  type PendingEnrollmentFilters,
} from "@/lib/services/applications.service";

export function useApplications(filters: ApplicationListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.applications(filters),
    queryFn: () => getApplications(filters),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.application(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  });
}

export function useEnrollApplicationCourse(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationCourseId: string) =>
      enrollApplicationCourse(applicationCourseId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.application(applicationId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingEnrollments(),
      });
    },
  });
}

export function useRejectApplicationCourse(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationCourseId,
      reason,
    }: {
      applicationCourseId: string;
      reason?: string;
    }) => rejectApplicationCourse(applicationCourseId, reason),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.application(applicationId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications(),
      });
    },
  });
}

export function usePendingEnrollments(filters: PendingEnrollmentFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.pendingEnrollments(filters),
    queryFn: () => getPendingEnrollments(filters),
  });
}

export function usePendingShortlist(search?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pendingShortlist(search),
    queryFn: () => getPendingShortlist(search),
  });
}

export function usePendingShortlistDetail(applicationCourseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pendingShortlistDetail(applicationCourseId),
    queryFn: () => getPendingShortlistDetail(applicationCourseId),
    enabled: !!applicationCourseId,
  });
}

export function useEnrollPendingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationCourseId: string) =>
      enrollApplicationCourse(applicationCourseId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingEnrollments(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications(),
      });
    },
  });
}
