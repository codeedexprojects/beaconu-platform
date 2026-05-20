import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeHostels,
  createCollegeHostel,
  deleteCollegeHostel,
  getCollegeCommuteRoutes,
  createCollegeCommuteRoute,
  deleteCollegeCommuteRoute,
} from "@/lib/services/colleges.service";

export function useCollegeHostels(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.hostels,
    queryFn: getCollegeHostels,
    enabled,
  });
}

export function useCreateCollegeHostel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createCollegeHostel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCollegeHostel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeHostel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCollegeCommutes(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.commutes,
    queryFn: getCollegeCommuteRoutes,
    enabled,
  });
}

export function useCreateCollegeCommute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createCollegeCommuteRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commutes });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCollegeCommute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeCommuteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commutes });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
