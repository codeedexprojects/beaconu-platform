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
  discipline: { name: string; stream: { name: string } };
  studyLevel: { name: string };
  programType: { name: string };
  studyMode: string;
  intakeCapacity: number | null;
  durationMonths: number | null;
  tuitionFee: number | null;
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
}

export const publicCollegeService = {
  getBySlug: (slug: string) =>
    publicFetch<PublicCollege>(`/api/v1/public/colleges/by-slug/${slug}`),
};
