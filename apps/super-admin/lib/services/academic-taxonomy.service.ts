import { api } from "../api";

export interface StreamLookup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Discipline {
  id: string;
  streamId: string;
  name: string;
  slug: string;
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
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateDisciplineInput {
  stream_id?: string;
  name?: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateSimpleTaxonomyInput {
  name: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateSimpleTaxonomyInput = Partial<CreateSimpleTaxonomyInput>;

export const academicTaxonomyService = {
  getStreams: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<StreamLookup[]>(
      `/api/v1/admin/universities/streams${params}`,
    );
  },

  createStream: (data: CreateSimpleTaxonomyInput) =>
    api.post<StreamLookup>("/api/v1/admin/universities/streams", data),

  disableStream: (id: string) =>
    api.patch<StreamLookup>(
      `/api/v1/admin/universities/streams/${id}/disable`,
      {},
    ),

  getDisciplines: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<Discipline[]>(
      `/api/v1/admin/universities/disciplines${params}`,
    );
  },

  createDiscipline: (data: CreateDisciplineInput) =>
    api.post<Discipline>("/api/v1/admin/universities/disciplines", data),

  updateDiscipline: (id: string, data: UpdateDisciplineInput) =>
    api.patch<Discipline>(`/api/v1/admin/universities/disciplines/${id}`, data),

  disableDiscipline: (id: string) =>
    api.patch<Discipline>(
      `/api/v1/admin/universities/disciplines/${id}/disable`,
      {},
    ),

  removeDiscipline: (id: string) =>
    api.delete(`/api/v1/admin/universities/disciplines/${id}`),

  getStudyLevels: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<StudyLevel[]>(
      `/api/v1/admin/universities/study-levels${params}`,
    );
  },

  createStudyLevel: (data: CreateSimpleTaxonomyInput) =>
    api.post<StudyLevel>("/api/v1/admin/universities/study-levels", data),

  updateStudyLevel: (id: string, data: UpdateSimpleTaxonomyInput) =>
    api.patch<StudyLevel>(
      `/api/v1/admin/universities/study-levels/${id}`,
      data,
    ),

  disableStudyLevel: (id: string) =>
    api.patch<StudyLevel>(
      `/api/v1/admin/universities/study-levels/${id}/disable`,
      {},
    ),

  removeStudyLevel: (id: string) =>
    api.delete(`/api/v1/admin/universities/study-levels/${id}`),

  getProgramTypes: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<ProgramType[]>(
      `/api/v1/admin/universities/program-types${params}`,
    );
  },

  createProgramType: (data: CreateSimpleTaxonomyInput) =>
    api.post<ProgramType>("/api/v1/admin/universities/program-types", data),

  updateProgramType: (id: string, data: UpdateSimpleTaxonomyInput) =>
    api.patch<ProgramType>(
      `/api/v1/admin/universities/program-types/${id}`,
      data,
    ),

  disableProgramType: (id: string) =>
    api.patch<ProgramType>(
      `/api/v1/admin/universities/program-types/${id}/disable`,
      {},
    ),

  removeProgramType: (id: string) =>
    api.delete(`/api/v1/admin/universities/program-types/${id}`),
};
