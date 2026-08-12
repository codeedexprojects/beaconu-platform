import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeStudents,
  getEnrolledStudents,
  getStudentDetail,
  type CollegeStudentListFilters,
} from "@/lib/services/students.service";

export function useCollegeStudents(
  filters: CollegeStudentListFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.collegeStudents(filters),
    queryFn: () => getCollegeStudents(filters),
    enabled,
  });
}

export function useEnrolledStudents(filters: CollegeStudentListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.enrolledStudents(filters),
    queryFn: () => getEnrolledStudents(filters),
  });
}

export function useStudentDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.studentDetail(id ?? ""),
    queryFn: () => getStudentDetail(id as string),
    enabled: !!id,
  });
}
