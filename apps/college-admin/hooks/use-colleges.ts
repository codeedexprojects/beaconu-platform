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
  getMyInstitutionGroup,
  joinInstitutionGroup,
  updateCollegeCourse,
  deleteCollegeCourse,
  getCourseTabs,
  updateCourseTab,
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

export function useUpdateCollegeCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCourseInput>;
    }) => updateCollegeCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCollegeCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCourseTabs(courseId: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.courses, courseId, "tabs"],
    queryFn: () => getCourseTabs(courseId),
    enabled: !!courseId && enabled,
  });
}

export function useUpdateCourseTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      tabName,
      data,
    }: {
      courseId: string;
      tabName: string;
      data: any;
    }) => updateCourseTab(courseId, tabName, { data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.courses, variables.courseId, "tabs"],
      });
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

export function useMyInstitutionGroup() {
  return useQuery({
    queryKey: QUERY_KEYS.institutionGroup,
    queryFn: getMyInstitutionGroup,
  });
}

export function useJoinInstitutionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (group_code: string) => joinInstitutionGroup(group_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.institutionGroup });
      toast.success("Joined institution group successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
