import { api } from "../api";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface StreamLookup {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Discipline {
  id: string;
  streamId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  stream: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface StudyLevel {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProgramType {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDisciplineInput {
  stream_id: string;
  name: string;
  slug: string;
  logo_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateDisciplineInput {
  stream_id?: string;
  name?: string;
  slug?: string;
  logo_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateSimpleTaxonomyInput {
  name: string;
  slug: string;
  logo_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateSimpleTaxonomyInput = Partial<CreateSimpleTaxonomyInput>;

export interface TaxonomyListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  stream_id?: string;
}

function buildQuery(params: TaxonomyListParams): string {
  const p = new URLSearchParams();
  if (params.page !== undefined) p.set("page", String(params.page));
  if (params.limit !== undefined) p.set("limit", String(params.limit));
  if (params.search) p.set("search", params.search);
  if (params.is_active !== undefined)
    p.set("is_active", String(params.is_active));
  if (params.stream_id) p.set("stream_id", params.stream_id);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export const academicTaxonomyService = {
  getStreams: (params: TaxonomyListParams = {}) =>
    api.get<Paginated<StreamLookup>>(
      `/api/v1/admin/universities/streams${buildQuery(params)}`,
    ),

  // Flat list for dropdowns — fetches all active with high limit
  getAllActiveStreams: () =>
    api
      .get<
        Paginated<StreamLookup>
      >(`/api/v1/admin/universities/streams?is_active=true&limit=200`)
      .then((r) => r.data),

  createStream: (data: CreateSimpleTaxonomyInput) =>
    api.post<StreamLookup>("/api/v1/admin/universities/streams", data),

  enableStream: (id: string) =>
    api.patch<StreamLookup>(`/api/v1/admin/universities/streams/${id}`, {
      is_active: true,
    }),

  disableStream: (id: string) =>
    api.patch<StreamLookup>(
      `/api/v1/admin/universities/streams/${id}/disable`,
      {},
    ),

  getDisciplines: (params: TaxonomyListParams = {}) =>
    api.get<Paginated<Discipline>>(
      `/api/v1/admin/universities/disciplines${buildQuery(params)}`,
    ),

  createDiscipline: (data: CreateDisciplineInput) =>
    api.post<Discipline>("/api/v1/admin/universities/disciplines", data),

  updateDiscipline: (id: string, data: UpdateDisciplineInput) =>
    api.patch<Discipline>(`/api/v1/admin/universities/disciplines/${id}`, data),

  enableDiscipline: (id: string) =>
    api.patch<Discipline>(`/api/v1/admin/universities/disciplines/${id}`, {
      is_active: true,
    }),

  disableDiscipline: (id: string) =>
    api.patch<Discipline>(
      `/api/v1/admin/universities/disciplines/${id}/disable`,
      {},
    ),

  removeDiscipline: (id: string) =>
    api.delete(`/api/v1/admin/universities/disciplines/${id}`),

  getStudyLevels: (params: TaxonomyListParams = {}) =>
    api.get<Paginated<StudyLevel>>(
      `/api/v1/admin/universities/study-levels${buildQuery(params)}`,
    ),

  createStudyLevel: (data: CreateSimpleTaxonomyInput) =>
    api.post<StudyLevel>("/api/v1/admin/universities/study-levels", data),

  updateStudyLevel: (id: string, data: UpdateSimpleTaxonomyInput) =>
    api.patch<StudyLevel>(
      `/api/v1/admin/universities/study-levels/${id}`,
      data,
    ),

  enableStudyLevel: (id: string) =>
    api.patch<StudyLevel>(`/api/v1/admin/universities/study-levels/${id}`, {
      is_active: true,
    }),

  disableStudyLevel: (id: string) =>
    api.patch<StudyLevel>(
      `/api/v1/admin/universities/study-levels/${id}/disable`,
      {},
    ),

  removeStudyLevel: (id: string) =>
    api.delete(`/api/v1/admin/universities/study-levels/${id}`),

  getProgramTypes: (params: TaxonomyListParams = {}) =>
    api.get<Paginated<ProgramType>>(
      `/api/v1/admin/universities/program-types${buildQuery(params)}`,
    ),

  createProgramType: (data: CreateSimpleTaxonomyInput) =>
    api.post<ProgramType>("/api/v1/admin/universities/program-types", data),

  updateProgramType: (id: string, data: UpdateSimpleTaxonomyInput) =>
    api.patch<ProgramType>(
      `/api/v1/admin/universities/program-types/${id}`,
      data,
    ),

  enableProgramType: (id: string) =>
    api.patch<ProgramType>(`/api/v1/admin/universities/program-types/${id}`, {
      is_active: true,
    }),

  disableProgramType: (id: string) =>
    api.patch<ProgramType>(
      `/api/v1/admin/universities/program-types/${id}/disable`,
      {},
    ),

  removeProgramType: (id: string) =>
    api.delete(`/api/v1/admin/universities/program-types/${id}`),
};
