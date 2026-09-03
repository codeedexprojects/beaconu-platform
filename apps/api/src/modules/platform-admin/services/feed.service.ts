import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { FeedRepository } from "../repositories/feed.repository";
import { CreateFeedInput, UpdateFeedInput } from "../validators/feed.validator";

export class FeedService {
  static async create(data: CreateFeedInput) {
    return FeedRepository.create({
      caption: data.caption,
      thumbnailUrl: data.thumbnail_url,
      videoUrl: data.video_url,
      displayOrder: data.display_order ?? 0,
    });
  }

  static async update(id: string, data: UpdateFeedInput) {
    const existing = await FeedRepository.findById(id);
    if (!existing) throw new NotFoundError("Feed item not found");

    return FeedRepository.updateById(id, {
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.thumbnail_url !== undefined
        ? { thumbnailUrl: data.thumbnail_url }
        : {}),
      ...(data.video_url !== undefined ? { videoUrl: data.video_url } : {}),
      ...(data.display_order !== undefined
        ? { displayOrder: data.display_order }
        : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await FeedRepository.findById(id);
    if (!existing) throw new NotFoundError("Feed item not found");
    if (!existing.isActive)
      throw new ForbiddenError("Feed item is already inactive");
    return FeedRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await FeedRepository.findById(id);
    if (!existing) throw new NotFoundError("Feed item not found");
    if (existing.isActive)
      throw new ForbiddenError("Feed item is already active");
    return FeedRepository.updateById(id, { isActive: true });
  }
}
