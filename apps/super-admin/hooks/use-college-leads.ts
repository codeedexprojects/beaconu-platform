import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  collegeLeadsService,
  type CollegeLead,
  type CollegeLeadUpsertInput,
  type CollegeLeadStats,
  type CollegeLeadsListResponse,
} from "@/lib/services/college-leads.service";

export function useCollegeLeads(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.collegeLeads, filters],
    queryFn: () => collegeLeadsService.getAll(filters),
  });
}

export function useCollegeLeadStats() {
  return useQuery({
    queryKey: QUERY_KEYS.collegeLeadStats,
    queryFn: () => collegeLeadsService.getStats(),
  });
}

export function useCollegeLeadById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.collegeLead(id),
    queryFn: () => collegeLeadsService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateCollegeLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      review_remarks,
      enableInstitutionGroup,
    }: {
      id: string;
      status: string;
      review_remarks?: string;
      enableInstitutionGroup?: boolean;
    }) =>
      collegeLeadsService.updateStatus(
        id,
        status,
        review_remarks,
        enableInstitutionGroup,
      ),

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },

    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.collegeLeads],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeLeadStats,
      });
    },
  });
}

export function useCreateCollegeLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CollegeLeadUpsertInput) =>
      collegeLeadsService.create(data),

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.collegeLeads],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeLeadStats,
      });
    },
  });
}

export function useUpdateCollegeLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollegeLeadUpsertInput }) =>
      collegeLeadsService.update(id, data),

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.collegeLeads],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeLead(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.collegeLeadStats,
      });
    },
  });
}
