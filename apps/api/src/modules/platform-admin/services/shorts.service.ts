import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { ShortsRepository } from "../repositories/shorts.repository";
import {
  CreateShortInput,
  UpdateShortInput,
} from "../validators/shorts.validator";

export class ShortsService {
  static async create(data: CreateShortInput) {
    return ShortsRepository.create({
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
      videoUrl: data.video_url,
      displayOrder: data.display_order ?? 0,
    });
  }

  static async update(id: string, data: UpdateShortInput) {
    const existing = await ShortsRepository.findById(id);
    if (!existing) throw new NotFoundError("Short not found");

    return ShortsRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
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
    const existing = await ShortsRepository.findById(id);
    if (!existing) throw new NotFoundError("Short not found");
    if (!existing.isActive)
      throw new ForbiddenError("Short is already inactive");
    return ShortsRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await ShortsRepository.findById(id);
    if (!existing) throw new NotFoundError("Short not found");
    if (existing.isActive) throw new ForbiddenError("Short is already active");
    return ShortsRepository.updateById(id, { isActive: true });
  }
}
