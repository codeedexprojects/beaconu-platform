export type NoticeStatus = "published" | "archived";

export interface NoticeAttachmentItem {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface NoticeListItem {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  status: NoticeStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeDetail extends NoticeListItem {
  requiredDocuments: string[];
  attachments: NoticeAttachmentItem[];
}

export interface NoticeListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NoticeListResponse {
  notices: NoticeListItem[];
  meta: NoticeListMeta;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  category?: string;
  is_pinned?: boolean;
  required_documents?: string[];
  attachments?: NoticeAttachmentItem[];
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  category?: string;
  is_pinned?: boolean;
  required_documents?: string[];
  attachments?: NoticeAttachmentItem[];
}
