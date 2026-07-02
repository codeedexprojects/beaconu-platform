import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import {
  collegesService,
  type CollegesListResponse,
  type CollegeDetail,
  type CollegeStats,
} from "@/lib/services/colleges.service";

export function useColleges(filters?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.colleges, filters],
    queryFn: () => collegesService.getAll(filters),
  });
}

export function useCollegeStats() {
  return useQuery({
    queryKey: QUERY_KEYS.collegeStats,
    queryFn: () => collegesService.getStats(),
  });
}

export function useCollegeById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.college(id),
    queryFn: () => collegesService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateCollegeListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collegeId,
      isListed,
    }: {
      collegeId: string;
      isListed: boolean;
    }) => collegesService.updateListingStatus(collegeId, isListed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.colleges] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
