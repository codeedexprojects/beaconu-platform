import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCourseSwitchRequests,
  reviewCourseSwitchRequest,
  type CourseSwitchRequestListFilters,
} from "@/lib/services/course-switch-requests.service";
import type { ReviewCourseSwitchInput } from "@beaconu/types";

export function useCourseSwitchRequests(
  filters: CourseSwitchRequestListFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseSwitchRequests(filters),
    queryFn: () => getCourseSwitchRequests(filters),
  });
}

export function useReviewCourseSwitchRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewCourseSwitchInput }) =>
      reviewCourseSwitchRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseSwitchRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
