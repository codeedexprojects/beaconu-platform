export interface InstituteOfNationalImportanceItem {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  collegesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstituteOfNationalImportanceInput {
  name: string;
  icon_url?: string | null;
  colleges_count?: number;
  sort_order?: number;
}

export interface UpdateInstituteOfNationalImportanceInput {
  name?: string;
  icon_url?: string | null;
  colleges_count?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface ListInstitutesOfNationalImportanceQuery {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
