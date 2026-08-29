export interface SiteAnnouncementItem {
  id: string;
  title: string;
  date: string;
  link: string | null;
  highlighted: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteAnnouncementInput {
  title: string;
  date: string;
  link?: string | null;
  highlighted?: boolean;
}

export type UpdateSiteAnnouncementInput =
  Partial<CreateSiteAnnouncementInput> & {
    is_active?: boolean;
  };

export interface PublicSiteAnnouncement {
  id: string;
  title: string;
  date: string;
  link: string | null;
  highlighted: boolean;
}
