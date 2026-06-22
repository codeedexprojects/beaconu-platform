import { api } from "@/lib/api";

export interface PublicCollege {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string | null;
  university?: {
    id: string;
    name: string;
    type: string;
    logoUrl?: string | null;
  } | null;
}

export interface PublicCollegeSectionResponse {
  sectionName: string;
  sectionId?: string;
  sectionKey: string;
  data: unknown;
}

export interface PublicCollegeSummaryQuery {
  universityId?: string;
  streamId?: string;
  disciplineId?: string;
  studyLevelId?: string;
  programTypeId?: string;
}

export interface PublicCollegeSummary {
  college: {
    id: string;
    name: string;
    slug: string;
    code: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    domain?: string | null;
    location: {
      address: string | null;
      city: string | null;
      state: string | null;
      district: string | null;
      pinCode: string | null;
    };
  };
  course: {
    id: string;
    name: string;
    code: string;
    duration?: string | null;
    eligibility?: string | null;
    intakeCapacity?: number | null;
    studyMode: string;
    discipline: {
      id: string;
      name: string;
      slug: string;
      stream: {
        id: string;
        name: string;
        slug: string;
      };
    };
    studyLevel: {
      id: string;
      name: string;
      slug: string;
    };
    programType: {
      id: string;
      name: string;
      slug: string;
    };
    campus?: {
      id: string;
      name: string;
      address: string | null;
      city: string | null;
      state: string | null;
    } | null;
  };
  tabListing: string[];
}

export async function getPublicColleges(): Promise<PublicCollege[]> {
  return api.get<PublicCollege[]>("/api/v1/public/colleges", {
    skipAuth: true,
    suppress401Redirect: true,
  });
}

function buildQueryString(query: PublicCollegeSummaryQuery) {
  const params = new URLSearchParams();

  if (query.universityId) params.set("universityId", query.universityId);
  if (query.streamId) params.set("streamId", query.streamId);
  if (query.disciplineId) params.set("disciplineId", query.disciplineId);
  if (query.studyLevelId) params.set("studyLevelId", query.studyLevelId);
  if (query.programTypeId) params.set("programTypeId", query.programTypeId);

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function getPublicCollegeBySlug(
  slug: string,
): Promise<PublicCollege> {
  return api.get<PublicCollege>(`/api/v1/public/colleges/by-slug/${slug}`, {
    skipAuth: true,
    suppress401Redirect: true,
  });
}

export async function getPublicCollegeSection(
  collegeId: string,
  sectionName: string,
): Promise<PublicCollegeSectionResponse> {
  return api.get<PublicCollegeSectionResponse>(
    `/api/v1/public/colleges/${collegeId}/section/${encodeURIComponent(sectionName)}`,
    {
      skipAuth: true,
      suppress401Redirect: true,
    },
  );
}

export async function getPublicCollegeSummary(
  collegeId: string,
  query: PublicCollegeSummaryQuery = {},
): Promise<PublicCollegeSummary> {
  return api.get<PublicCollegeSummary>(
    `/api/v1/public/colleges/${collegeId}/summary${buildQueryString(query)}`,
    {
      skipAuth: true,
      suppress401Redirect: true,
    },
  );
}
