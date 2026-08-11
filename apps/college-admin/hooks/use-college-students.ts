import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeStudents,
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
