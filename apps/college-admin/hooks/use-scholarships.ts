import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getScholarshipConfigs,
  createScholarshipConfig,
  updateScholarshipConfig,
  getScholarshipApplications,
  reviewScholarshipApplication,
} from "@/lib/services/scholarships.service";
import type {
  CreateScholarshipConfigInput,
  UpdateScholarshipConfigInput,
  ReviewScholarshipApplicationInput,
} from "@beaconu/types";

export function useScholarshipConfigs() {
  return useQuery({
    queryKey: QUERY_KEYS.scholarshipConfigs,
    queryFn: () => getScholarshipConfigs(),
  });
}

export function useCreateScholarshipConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScholarshipConfigInput) =>
      createScholarshipConfig(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.scholarshipConfigs,
      });
    },
  });
}

export function useUpdateScholarshipConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScholarshipConfigInput;
    }) => updateScholarshipConfig(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.scholarshipConfigs,
      });
    },
  });
}

export function useScholarshipApplications(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.scholarshipApplications(status),
    queryFn: () => getScholarshipApplications(status),
  });
}

export function useReviewScholarshipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReviewScholarshipApplicationInput;
    }) => reviewScholarshipApplication(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.scholarshipApplications(),
      });
    },
  });
}
