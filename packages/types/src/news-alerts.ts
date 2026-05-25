export interface NewsAlert {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  source: string | null;
  collegeId: string | null;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsAlertListItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  tags: string[];
  source: string | null;
  collegeId: string | null;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsAlertInput {
  title: string;
  summary?: string;
  content: string;
  cover_image_url?: string;
  tags?: string[];
  source?: string;
  college_id?: string;
}

export interface UpdateNewsAlertInput {
  title?: string;
  summary?: string;
  content?: string;
  cover_image_url?: string;
  tags?: string[];
  source?: string;
}
