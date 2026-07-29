export interface IconItem {
  id: string;
  name: string;
  iconUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIconInput {
  name: string;
  icon_url: string;
}

export interface UpdateIconInput {
  name?: string;
  icon_url?: string;
  is_active?: boolean;
}
