import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  createCollegeCampus,
  createCollegeCourse,
  getCollegeCampuses,
  getCollegeCourses,
  getCollegeProfile,
  submitCollegeRegistration,
  updateCollegeProfile,
  type CreateCampusInput,
  type CreateCourseInput,
  type UpdateCollegeProfileInput,
} from "@/lib/services/colleges.service";

export function useCollegeProfile(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: getCollegeProfile,
    enabled,
  });
}

export function useCollegeCampuses(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.campuses,
    queryFn: getCollegeCampuses,
    enabled,
  });
}

export function useCollegeCourses(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.courses,
    queryFn: getCollegeCourses,
    enabled,
  });
}

export function useUpdateCollegeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCollegeProfileInput) => updateCollegeProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateCollegeCampus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampusInput) => createCollegeCampus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campuses });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateCollegeCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseInput) => createCollegeCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSubmitCollegeRegistration() {
  return useMutation({
    mutationFn: submitCollegeRegistration,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
