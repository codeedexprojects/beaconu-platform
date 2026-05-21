import { cookies } from "next/headers";
import type {
  EntranceExam,
  EntranceExamListItem,
  PaginationMeta,
} from "@beaconu/types";
import { API_BASE, STUDENT_TOKEN_KEY } from "@/lib/constants";

interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_TOKEN_KEY)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getActiveEntranceExams(params?: {
  exam_level?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EntranceExamListItem>> {
  const query = new URLSearchParams();
  if (params?.exam_level) query.set("exam_level", params.exam_level);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  query.set("limit", String(params?.limit ?? 12));

  const res = await fetch(
    `${API_BASE}/api/v1/student/entrance-exams?${query.toString()}`,
    { cache: "no-store", headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch entrance exams");
  const body = await res.json();
  return { data: body.data ?? [], meta: body.meta };
}

export async function getEntranceExamById(id: string): Promise<EntranceExam> {
  const res = await fetch(`${API_BASE}/api/v1/student/entrance-exams/${id}`, {
    cache: "no-store",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Entrance exam not found");
  const body = await res.json();
  return body.data;
}
