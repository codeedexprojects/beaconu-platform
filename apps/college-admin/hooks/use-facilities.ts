import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeHostels,
  createCollegeHostel,
  deleteCollegeHostel,
  updateCollegeHostel,
  createHostelRoomType,
  updateHostelRoomType,
  deleteHostelRoomType,
  createHostelMessPlan,
  updateHostelMessPlan,
  deleteHostelMessPlan,
  createHostelAddonService,
  updateHostelAddonService,
  deleteHostelAddonService,
  getCollegeLibraries,
  createCollegeLibrary,
  updateCollegeLibrary,
  deleteCollegeLibrary,
  getCollegeDepartments,
  getCollegeCommuteRoutes,
  createCollegeCommuteRoute,
  deleteCollegeCommuteRoute,
  getCollegeCommuteEnrollments,
  getCollegeCommuteEnrollment,
  getCollegeHostelEnrollments,
  getCollegeHostelEnrollment,
  type CreateCommuteRouteInput,
  type CommuteEnrollmentFilters,
  type HostelEnrollmentFilters,
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

export function useUpdateCollegeHostel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCollegeHostel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateHostelRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, data }: { hostelId: string; data: any }) =>
      createHostelRoomType(hostelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateHostelRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostelId,
      id,
      data,
    }: {
      hostelId: string;
      id: string;
      data: any;
    }) => updateHostelRoomType(hostelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteHostelRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, id }: { hostelId: string; id: string }) =>
      deleteHostelRoomType(hostelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateHostelMessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, data }: { hostelId: string; data: any }) =>
      createHostelMessPlan(hostelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateHostelMessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostelId,
      id,
      data,
    }: {
      hostelId: string;
      id: string;
      data: any;
    }) => updateHostelMessPlan(hostelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteHostelMessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, id }: { hostelId: string; id: string }) =>
      deleteHostelMessPlan(hostelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateHostelAddonService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, data }: { hostelId: string; data: any }) =>
      createHostelAddonService(hostelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateHostelAddonService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostelId,
      id,
      data,
    }: {
      hostelId: string;
      id: string;
      data: any;
    }) => updateHostelAddonService(hostelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteHostelAddonService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostelId, id }: { hostelId: string; id: string }) =>
      deleteHostelAddonService(hostelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hostels });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCollegeLibraries(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.libraries,
    queryFn: getCollegeLibraries,
    enabled,
  });
}

export function useCreateCollegeLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createCollegeLibrary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.libraries });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCollegeLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCollegeLibrary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.libraries });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCollegeLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.libraries });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCollegeDepartments(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.lookupsDepartments,
    queryFn: getCollegeDepartments,
    enabled,
  });
}

export function useCollegeCommutes(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.commutes,
    queryFn: getCollegeCommuteRoutes,
    enabled,
  });
}

export function useCollegeCommuteEnrollments(
  filters: CommuteEnrollmentFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.commuteEnrollments(filters),
    queryFn: () => getCollegeCommuteEnrollments(filters),
  });
}

export function useCollegeCommuteEnrollment(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.commuteEnrollment(id ?? ""),
    queryFn: () => getCollegeCommuteEnrollment(id as string),
    enabled: !!id,
  });
}

export function useCollegeHostelEnrollments(
  filters: HostelEnrollmentFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.hostelEnrollments(filters),
    queryFn: () => getCollegeHostelEnrollments(filters),
  });
}

export function useCollegeHostelEnrollment(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.hostelEnrollment(id ?? ""),
    queryFn: () => getCollegeHostelEnrollment(id as string),
    enabled: !!id,
  });
}

export function useCreateCollegeCommute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommuteRouteInput) =>
      createCollegeCommuteRoute(data),
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
