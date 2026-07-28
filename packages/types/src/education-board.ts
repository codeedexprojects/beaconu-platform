export type EducationBoardGrade = "10th" | "12th";

export interface EducationBoardSubjectItem {
  id: string;
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

/** Student-facing board picker item — name/grade only, no subjects (that's
 * a separate per-board fetch via Get Education Board). */
export interface EducationBoardNameItem {
  id: string;
  name: string;
  grade: EducationBoardGrade;
  slug: string;
}
