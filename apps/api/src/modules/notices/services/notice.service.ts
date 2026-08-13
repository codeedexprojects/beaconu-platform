import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { NoticeRepository } from "../repositories/notice.repository";
import type {
  CreateNoticeInput,
  NoticeAttachmentItem,
  UpdateNoticeInput,
} from "@beaconu/types";

async function notifyEnrolledStudents(
  collegeId: string,
  noticeId: string,
  title: string,
): Promise<void> {
  try {
    const studentIds =
      await EnrollmentService.listStudentIdsForCollege(collegeId);
    if (studentIds.length === 0) return;
    await PushService.sendToUsers(
      studentIds.map((id) => ({ userId: id, userType: "student" })),
      {
        title: "New notice from your college",
        body: title,
        data: { type: "notice_published", noticeId },
      },
    );
  } catch (error) {
    logger.error(
      { err: error, collegeId, noticeId },
      "Failed to notify students of new notice",
    );
  }
}

function mapListItem(row: {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isPinned: row.isPinned,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDetail(row: {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  requiredDocuments: unknown;
  attachments: unknown;
}) {
  return {
    ...mapListItem(row),
    requiredDocuments: (row.requiredDocuments ?? []) as string[],
    attachments: (row.attachments ?? []) as NoticeAttachmentItem[],
  };
}

async function assertEnrolled(studentId: string, collegeId: string) {
  const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
    studentId,
    collegeId,
  );
  if (!hasEnrollment) {
    throw new ForbiddenError("You are not enrolled at this college");
  }
}

export class NoticeService {
  // ── college-admin ──

  static async listForCollege(
    collegeId: string,
    filters: {
      status?: string;
      category?: string;
      search?: string;
      fromDate?: Date;
      toDate?: Date;
    },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await NoticeRepository.list(
      collegeId,
      filters,
      pagination,
    );
    return {
      notices: rows.map(mapListItem),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getForCollege(collegeId: string, id: string) {
    const row = await NoticeRepository.findById(id, collegeId);
    if (!row) throw new NotFoundError("Notice not found");
    return mapDetail(row);
  }

  static async create(
    collegeId: string,
    staffId: string,
    data: CreateNoticeInput,
  ) {
    const row = await NoticeRepository.create({
      collegeId,
      title: data.title,
      content: data.content,
      category: data.category ?? "general",
      isPinned: data.is_pinned ?? false,
      requiredDocuments: data.required_documents ?? [],
      attachments: data.attachments ?? [],
      createdBy: staffId,
    });
    await notifyEnrolledStudents(collegeId, row.id, row.title);
    return mapDetail(row);
  }

  static async update(collegeId: string, id: string, data: UpdateNoticeInput) {
    const existing = await NoticeRepository.findById(id, collegeId);
    if (!existing) throw new NotFoundError("Notice not found");

    const row = await NoticeRepository.update(id, {
      title: data.title,
      content: data.content,
      category: data.category,
      isPinned: data.is_pinned,
      requiredDocuments: data.required_documents,
      attachments: data.attachments,
    });
    return mapDetail(row);
  }

  static async archive(collegeId: string, id: string) {
    const existing = await NoticeRepository.findById(id, collegeId);
    if (!existing) throw new NotFoundError("Notice not found");
    const row = await NoticeRepository.setStatus(id, "archived");
    return mapDetail(row);
  }

  static async restore(collegeId: string, id: string) {
    const existing = await NoticeRepository.findById(id, collegeId);
    if (!existing) throw new NotFoundError("Notice not found");
    const row = await NoticeRepository.setStatus(id, "published");
    return mapDetail(row);
  }

  // ── student ──

  static async listForStudent(
    studentId: string,
    collegeId: string,
    filters: {
      status?: "published" | "archived";
      category?: string;
      search?: string;
      fromDate?: Date;
      toDate?: Date;
    },
    pagination: { page: number; limit: number },
  ) {
    await assertEnrolled(studentId, collegeId);
    const { rows, total } = await NoticeRepository.list(
      collegeId,
      {
        status: filters.status ?? "published",
        category: filters.category,
        search: filters.search,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      },
      pagination,
    );
    return {
      notices: rows.map(mapListItem),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  // No college_id needed from the client here — the notice's own college is
  // looked up first, then we verify the student is enrolled there. Avoids
  // trusting a client-supplied collegeId for an authorization decision.
  static async getForStudent(studentId: string, id: string) {
    const row = await NoticeRepository.findByIdGlobal(id);
    if (!row) throw new NotFoundError("Notice not found");
    await assertEnrolled(studentId, row.collegeId);
    return mapDetail(row);
  }
}
