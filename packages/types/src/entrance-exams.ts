export interface EntranceExam {
  id: string;
  name: string;
  code: string;
  conductingBody: string | null;
  examLevel: string;
  applicableCourses: string[];
  eligibility: string | null;
  description: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  examDate: string | null;
  resultDate: string | null;
  officialWebsite: string | null;
  status: "active" | "inactive";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntranceExamListItem {
  id: string;
  name: string;
  code: string;
  conductingBody: string | null;
  examLevel: string;
  applicableCourses: string[];
  examDate: string | null;
  registrationEnd: string | null;
  officialWebsite: string | null;
  status: "active" | "inactive";
  createdAt: string;
}

export interface CreateEntranceExamInput {
  name: string;
  code: string;
  conducting_body?: string;
  exam_level: string;
  applicable_courses?: string[];
  eligibility?: string;
  description?: string;
  registration_start?: string;
  registration_end?: string;
  exam_date?: string;
  result_date?: string;
  official_website?: string;
}

export interface UpdateEntranceExamInput {
  name?: string;
  code?: string;
  conducting_body?: string;
  exam_level?: string;
  applicable_courses?: string[];
  eligibility?: string;
  description?: string;
  registration_start?: string | null;
  registration_end?: string | null;
  exam_date?: string | null;
  result_date?: string | null;
  official_website?: string;
  status?: "active" | "inactive";
}
