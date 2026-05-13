// Nested university type reference — returned embedded inside University responses.
export interface UniversityTypeRef {
  id: string;
  name: string;
  slug: string;
}

// Full university response DTO.
export interface University {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  city: string | null;
  accreditation: string | null;
  governanceDetails: string | null;
  logoUrl: string | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  universityType: UniversityTypeRef;
}

// Full university type response DTO — returned by /universities/types endpoints.
export interface UniversityType {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}
