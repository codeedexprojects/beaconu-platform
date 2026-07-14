import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAdmissionCycles,
  createAdmissionCycle,
  updateAdmissionCycle,
  deleteAdmissionCycle,
  getAdmissionCycleCourses,
  attachAdmissionCycleCourse,
  updateAdmissionCycleCourse,
  detachAdmissionCycleCourse,
  getCourseQuotaSeats,
  attachCourseQuota,
  updateCourseQuotaSeats,
  detachCourseQuota,
  getSeatPools,
  createSeatPool,
  updateSeatPool,
  deleteSeatPool,
  type AdmissionCycleListFilters,
} from "@/lib/services/admission-cycles.service";
import type {
  AttachAdmissionCycleCourseInput,
  AttachCourseQuotaInput,
  CreateAdmissionCycleInput,
  CreateSeatPoolInput,
  UpdateAdmissionCycleCourseInput,
  UpdateAdmissionCycleInput,
  UpdateCourseQuotaSeatsInput,
  UpdateSeatPoolInput,
} from "@beaconu/types";

export function useAdmissionCycles(filters: AdmissionCycleListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admissionCycles(filters),
    queryFn: () => getAdmissionCycles(filters),
  });
}

export function useCreateAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdmissionCycleInput) => createAdmissionCycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAdmissionCycleInput;
    }) => updateAdmissionCycle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmissionCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAdmissionCycleCourses(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admissionCycleCourses(admissionCycleId ?? ""),
    queryFn: () => getAdmissionCycleCourses(admissionCycleId as string),
    enabled: !!admissionCycleId,
  });
}

export function useAttachAdmissionCycleCourse(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttachAdmissionCycleCourseInput) =>
      attachAdmissionCycleCourse(admissionCycleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admissionCycleCourses(admissionCycleId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAdmissionCycleCourse(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAdmissionCycleCourseInput;
    }) => updateAdmissionCycleCourse(admissionCycleId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admissionCycleCourses(admissionCycleId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDetachAdmissionCycleCourse(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      detachAdmissionCycleCourse(admissionCycleId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admissionCycleCourses(admissionCycleId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCourseQuotaSeats(
  admissionCycleId?: string,
  courseId?: string,
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseQuotaSeats(
      admissionCycleId ?? "",
      courseId ?? "",
    ),
    queryFn: () =>
      getCourseQuotaSeats(admissionCycleId as string, courseId as string),
    enabled: !!admissionCycleId && !!courseId,
  });
}

export function useAttachCourseQuota(
  admissionCycleId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttachCourseQuotaInput) =>
      attachCourseQuota(admissionCycleId, courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotaSeats(admissionCycleId, courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCourseQuotaSeats(
  admissionCycleId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCourseQuotaSeatsInput;
    }) => updateCourseQuotaSeats(admissionCycleId, courseId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotaSeats(admissionCycleId, courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDetachCourseQuota(
  admissionCycleId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      detachCourseQuota(admissionCycleId, courseId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseQuotaSeats(admissionCycleId, courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSeatPools(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.seatPools(admissionCycleId ?? ""),
    queryFn: () => getSeatPools(admissionCycleId as string),
    enabled: !!admissionCycleId,
  });
}

export function useCreateSeatPool(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSeatPoolInput) =>
      createSeatPool(admissionCycleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatPools(admissionCycleId),
      });
      // Pooling attaches/detaches CourseQuotaSeats rows too — invalidate
      // every course's quota-seats view for this cycle, not just the pool.
      queryClient.invalidateQueries({
        queryKey: ["college-course-quota-seats", admissionCycleId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSeatPool(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeatPoolInput }) =>
      updateSeatPool(admissionCycleId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatPools(admissionCycleId),
      });
      // Pooling attaches/detaches CourseQuotaSeats rows too — invalidate
      // every course's quota-seats view for this cycle, not just the pool.
      queryClient.invalidateQueries({
        queryKey: ["college-course-quota-seats", admissionCycleId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSeatPool(admissionCycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSeatPool(admissionCycleId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seatPools(admissionCycleId),
      });
      // Pooling attaches/detaches CourseQuotaSeats rows too — invalidate
      // every course's quota-seats view for this cycle, not just the pool.
      queryClient.invalidateQueries({
        queryKey: ["college-course-quota-seats", admissionCycleId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
