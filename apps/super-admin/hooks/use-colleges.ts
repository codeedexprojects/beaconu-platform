import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
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
  const query = useQuery({
    queryKey: [QUERY_KEYS.colleges, filters],
    queryFn: () => collegesService.getAll(filters),
  });

  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);

  return query;
}

export function useCollegeStats() {
  const query = useQuery({
    queryKey: QUERY_KEYS.collegeStats,
    queryFn: () => collegesService.getStats(),
  });

  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);

  return query;
}

export function useCollegeById(id: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.college(id),
    queryFn: () => collegesService.getById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);

  return query;
}
