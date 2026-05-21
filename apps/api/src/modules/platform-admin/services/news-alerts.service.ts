import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { generateSlug } from "@/shared/utils";
import { NewsAlertsRepository } from "../repositories/news-alerts.repostory";
import {
  CreateNewsAlertInput,
  UpdateNewsAlertInput,
} from "../validators/news-alerts.validator";

async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(title);
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await NewsAlertsRepository.findBySlug(candidate);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

export class NewsAlertsService {
  static async listAll() {
    return NewsAlertsRepository.findAll();
  }

  static async create(data: CreateNewsAlertInput) {
    const slug = await generateUniqueSlug(data.title);

    return NewsAlertsRepository.create({
      title: data.title,
      slug,
      summary: data.summary ?? null,
      content: data.content,
      coverImageUrl: data.cover_image_url ?? null,
      tags: data.tags ?? [],
      source: data.source ?? null,
      collegeId: data.college_id ?? null,
      status: "draft",
      publishedAt: null,
      publishedBy: null,
    });
  }

  static async update(id: string, data: UpdateNewsAlertInput) {
    const existing = await NewsAlertsRepository.findById(id);
    if (!existing) throw new NotFoundError("News alert not found");
    if (existing.status === "archived")
      throw new ForbiddenError("Archived news alerts cannot be edited");

    let slug: string | undefined;
    if (data.title !== undefined && data.title !== existing.title) {
      slug = await generateUniqueSlug(data.title, id);
    }

    return NewsAlertsRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.cover_image_url !== undefined
        ? { coverImageUrl: data.cover_image_url }
        : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.source !== undefined ? { source: data.source } : {}),
    });
  }

  static async publish(id: string, adminId: string) {
    const existing = await NewsAlertsRepository.findById(id);
    if (!existing) throw new NotFoundError("News alert not found");
    if (existing.status === "published")
      throw new ForbiddenError("News alert is already published");
    if (existing.status === "archived")
      throw new ForbiddenError("Archived news alerts cannot be published");

    return NewsAlertsRepository.updateById(id, {
      status: "published",
      publishedAt: new Date(),
      publishedBy: adminId,
    });
  }

  static async archive(id: string) {
    const existing = await NewsAlertsRepository.findById(id);
    if (!existing) throw new NotFoundError("News alert not found");

    return NewsAlertsRepository.softDeleteById(id);
  }
}
