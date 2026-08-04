export type EducationBoardGrade = "10th" | "12th";

export interface EducationBoardSubjectItem {
  id: string;
  course: string;
  name: string;
  maxMark: string;
  passMark: string;
  sortOrder: number;
}

export interface EducationBoardItem {
  id: string;
  name: string;
  grade: EducationBoardGrade;
  slug: string;
  isActive: boolean;
  subjects: EducationBoardSubjectItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EducationBoardSubjectInput {
  course?: string;
  name: string;
  max_mark: number;
  pass_mark: number;
}

export interface CreateEducationBoardInput {
  name: string;
  grade: EducationBoardGrade;
  subjects: EducationBoardSubjectInput[];
}

export interface UpdateEducationBoardInput {
  name?: string;
  grade?: EducationBoardGrade;
  is_active?: boolean;
  subjects?: EducationBoardSubjectInput[];
}

export interface EducationBoardNameItem {
  id: string;
  name: string;
  grade: EducationBoardGrade;
  slug: string;
}
