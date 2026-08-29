import { NotFoundError } from "@/shared/errors";
import { SiteAnnouncementRepository } from "../repositories/site-announcement.repository";
import type {
  CreateSiteAnnouncementBody,
  UpdateSiteAnnouncementBody,
} from "../validators/site-announcement.validator";
import type { SiteAnnouncementItem } from "@beaconu/types";

type Row = Awaited<ReturnType<typeof SiteAnnouncementRepository.findById>>;

function mapRow(row: NonNullable<Row>): SiteAnnouncementItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date.toISOString(),
    link: row.link,
    highlighted: row.highlighted,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class SiteAnnouncementService {
  static async list(collegeId: string): Promise<SiteAnnouncementItem[]> {
    const rows = await SiteAnnouncementRepository.findByCollegeId(
      collegeId,
      true,
    );
    return rows.map(mapRow);
  }

  static async create(
    collegeId: string,
    body: CreateSiteAnnouncementBody,
  ): Promise<SiteAnnouncementItem> {
    const count = await SiteAnnouncementRepository.countByCollegeId(collegeId);

    const row = await SiteAnnouncementRepository.create({
      collegeId,
      title: body.title,
      date: body.date,
      link: body.link || null,
      highlighted: body.highlighted ?? false,
      sortOrder: count,
    });
    return mapRow(row);
  }

  static async update(
    collegeId: string,
    id: string,
    body: UpdateSiteAnnouncementBody,
  ): Promise<SiteAnnouncementItem> {
    const row = await SiteAnnouncementRepository.update(id, collegeId, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.date !== undefined && { date: body.date }),
      ...(body.link !== undefined && { link: body.link || null }),
      ...(body.highlighted !== undefined && {
        highlighted: body.highlighted,
      }),
      ...(body.is_active !== undefined && { isActive: body.is_active }),
    });
    if (!row) throw new NotFoundError("Announcement not found");
    return mapRow(row);
  }

  static async remove(collegeId: string, id: string): Promise<void> {
    const row = await SiteAnnouncementRepository.softDeleteById(id, collegeId);
    if (!row) throw new NotFoundError("Announcement not found");
  }

  static async reorder(
    collegeId: string,
    orderedIds: string[],
  ): Promise<SiteAnnouncementItem[]> {
    await SiteAnnouncementRepository.reorder(collegeId, orderedIds);
    const rows = await SiteAnnouncementRepository.findByCollegeId(
      collegeId,
      true,
    );
    return rows.map(mapRow);
  }

  static async listPublicBySlug(collegeSlug: string) {
    const rows =
      await SiteAnnouncementRepository.findPublicByCollegeSlug(collegeSlug);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date.toISOString(),
      link: row.link,
      highlighted: row.highlighted,
    }));
  }
}
