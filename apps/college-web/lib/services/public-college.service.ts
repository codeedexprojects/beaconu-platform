// Server-safe fetch — no auth store, no localStorage, works in RSC.
const SERVER_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed: ${res.status}`,
    );
  }

  const body = await res.json();
  return (body as { data: T }).data;
}

export interface PublicCampus {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  isMainCampus: boolean;
}

export interface PublicCourse {
  id: string;
  name: string;
  code: string;
  duration?: string | null;
  durationMonths?: number | null;
  eligibility?: string | null;
  intakeCapacity?: number | null;
  discipline: {
    id: string;
    name: string;
    slug: string;
    stream: { id: string; name: string; slug: string };
  };
  studyLevel: { id: string; name: string; slug: string };
  programType: { id: string; name: string; slug: string };
  studyMode: string;
  tuitionFee?: number | null;
  campus?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export interface PublicCollege {
  id: string;
  name: string;
  code: string;
  slug: string;
  domain: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  district: string | null;
  pinCode: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  profileSections: Record<string, any>;
  university: {
    id: string;
    name: string;
    logoUrl: string | null;
    universityType: { id: string; name: string; slug: string } | null;
  } | null;
  campuses: PublicCampus[];
  courses: PublicCourse[];
  institutionGroups?: {
    members: {
      college: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        city: string | null;
        state: string | null;
      };
    }[];
  }[];
  institutionGroupMember?: {
    group: {
      members: {
        college: {
          id: string;
          name: string;
          slug: string;
          logoUrl: string | null;
          city: string | null;
          state: string | null;
        };
      }[];
    };
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
    logoUrl: string | null;
    coverImageUrl: string | null;
    domain: string | null;
    location: {
      address: string | null;
      city: string | null;
      state: string | null;
      district: string | null;
      pinCode: string | null;
    };
  };
  course: PublicCourse;
  tabListing: string[];
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

export const publicCollegeService = {
  getBySlug: (slug: string) =>
    publicFetch<PublicCollege>(`/api/v1/public/colleges/by-slug/${slug}`),

  getSection: (collegeId: string, sectionName: string) =>
    publicFetch<PublicCollegeSectionResponse>(
      `/api/v1/public/colleges/${collegeId}/section/${encodeURIComponent(sectionName)}`,
    ),

  getSummary: (collegeId: string, query: PublicCollegeSummaryQuery = {}) =>
    publicFetch<PublicCollegeSummary>(
      `/api/v1/public/colleges/${collegeId}/summary${buildQueryString(query)}`,
    ),
};
