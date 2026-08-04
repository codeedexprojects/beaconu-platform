export interface UniversityTypeRef {
  id: string;
  name: string;
  slug: string;
}

export interface University {
  id: string;
  universityTypeId: string | null;
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
  universityType: UniversityTypeRef | null;
}

export interface UniversityType {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}
