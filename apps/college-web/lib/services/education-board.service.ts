import { api } from "@/lib/api";
import type {
  EducationBoardDetail,
  EducationBoardGrade,
  EducationBoardNameItem,
} from "@beaconu/types";

export async function listEducationBoards(
  grade: EducationBoardGrade,
  search?: string,
): Promise<EducationBoardNameItem[]> {
  const params = new URLSearchParams({ grade, page: "1", limit: "100" });
  if (search) params.set("search", search);
  return api.get(`/api/v1/student/education-boards?${params.toString()}`);
}

export async function getEducationBoardDetail(
  id: string,
  course?: string,
): Promise<EducationBoardDetail> {
  const query = course ? `?course=${encodeURIComponent(course)}` : "";
  return api.get(`/api/v1/student/education-boards/${id}${query}`);
}
