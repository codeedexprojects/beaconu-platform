import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  collegeLeadsService,
  type CollegeLead,
  type CollegeLeadStats,
  type CollegeLeadsListResponse,
} from "@/lib/services/college-leads.service";

export function useCollegeLeads(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = useQuery({
    queryKey: [QUERY_KEYS.collegeLeads, filters],
    queryFn: () => collegeLeadsService.getAll(filters),
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getErrorMessage(query.error));
    }
  }, [query.error]);

  return query;
}

export function useCollegeLeadStats() {
  const query = useQuery({
    queryKey: QUERY_KEYS.collegeLeadStats,
    queryFn: () => collegeLeadsService.getStats(),
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getErrorMessage(query.error));
    }
  }, [query.error]);

  return query;
}

export function useCollegeLeadById(id: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.collegeLead(id),
    queryFn: () => collegeLeadsService.getById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getErrorMessage(query.error));
    }
  }, [query.error]);

  return query;
}

export function useUpdateCollegeLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      review_remarks,
    }: {
      id: string;
      status: string;
      review_remarks?: string;
    }) => collegeLeadsService.updateStatus(id, status, review_remarks),

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
      toast.success("College lead status updated successfully");
    },
  });
}
