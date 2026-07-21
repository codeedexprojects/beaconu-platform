import { prisma } from "@beaconu/db";
import type {
  MediaKitListItem,
  MediaKitListResponse,
  PaginationMeta,
} from "@beaconu/types";
import type {
  MediaKitCollegeAdminListQuery,
  MediaKitAssociateListQuery,
} from "../validators/media-kit.validator";

const courseInclude = {
  select: { id: true, name: true, code: true },
} as const;

const collegeInclude = {
  select: { id: true, name: true },
} as const;

function mapToListItem(v: {
  id: string;
  collegeId: string;
  courseId: string | null;
  course: { id: string; name: string; code: string } | null;
  college?: { id: string; name: string };
  title: string;
  assetType: string;
  scope: string;
  fileUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MediaKitListItem {
  return {
    id: v.id,
    collegeId: v.collegeId,
    courseId: v.courseId,
    course: v.course,
    title: v.title,
    assetType: v.assetType as MediaKitListItem["assetType"],
    scope: v.scope as MediaKitListItem["scope"],
    fileUrl: v.fileUrl,
    fileName: v.fileName,
    fileSizeBytes: v.fileSizeBytes,
    thumbnailUrl: v.thumbnailUrl,
    sortOrder: v.sortOrder,
    isActive: v.isActive,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    ...(v.college ? { college: v.college } : {}),
  };
}

export class MediaKitQuery {
  static async listByCollege(
    collegeId: string,
    filters: MediaKitCollegeAdminListQuery,
  ): Promise<MediaKitListResponse> {
    const { asset_type, scope, course_id, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      collegeId,
      isActive: true,
      ...(asset_type ? { assetType: asset_type } : {}),
      ...(scope ? { scope } : {}),
      ...(course_id ? { courseId: course_id } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.mediaKit.count({ where }),
      prisma.mediaKit.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { course: courseInclude },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };

    return { items: rows.map(mapToListItem), meta };
  }

  static async listAcrossColleges(
    filters: MediaKitAssociateListQuery,
  ): Promise<MediaKitListResponse> {
    const { asset_type, scope, course_id, college_id, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(college_id ? { collegeId: college_id } : {}),
      ...(asset_type ? { assetType: asset_type } : {}),
      ...(scope ? { scope } : {}),
      ...(course_id ? { courseId: course_id } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.mediaKit.count({ where }),
      prisma.mediaKit.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { course: courseInclude, college: collegeInclude },
      }),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };

    return { items: rows.map(mapToListItem), meta };
  }
}
