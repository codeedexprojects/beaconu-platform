import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getEducationBoardDetail,
  listEducationBoards,
} from "@/lib/services/education-board.service";
import type { EducationBoardGrade } from "@beaconu/types";

export function useEducationBoards(
  grade: EducationBoardGrade,
  search: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.educationBoards(grade, search),
    queryFn: () => listEducationBoards(grade, search),
    enabled,
  });
}

export function useEducationBoardDetail(
  id: string | undefined,
  course: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.educationBoardDetail(id ?? "", course),
    queryFn: () => getEducationBoardDetail(id!, course),
    enabled: enabled && !!id,
  });
}
