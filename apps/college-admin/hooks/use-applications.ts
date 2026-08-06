import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getApplications,
  getApplicationById,
  enrollApplicationCourse,
  type ApplicationListFilters,
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
    },
  });
}
