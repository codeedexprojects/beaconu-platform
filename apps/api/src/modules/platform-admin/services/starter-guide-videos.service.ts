import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { StarterGuideVideosRepository } from "../repositories/starter-guide-videos.repository";
import {
  CreateStarterGuideVideoInput,
  UpdateStarterGuideVideoInput,
} from "../validators/starter-guide-videos.validator";

export class StarterGuideVideosService {
  static async create(data: CreateStarterGuideVideoInput) {
    return StarterGuideVideosRepository.create({
      title: data.title,
      videoKey: data.video_key,
      displayOrder: data.display_order ?? 0,
    });
  }

  static async update(id: string, data: UpdateStarterGuideVideoInput) {
    const existing = await StarterGuideVideosRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide video not found");

    return StarterGuideVideosRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.video_key !== undefined ? { videoKey: data.video_key } : {}),
      ...(data.display_order !== undefined
        ? { displayOrder: data.display_order }
        : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await StarterGuideVideosRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide video not found");
    if (!existing.isActive)
      throw new ForbiddenError("Starter guide video is already inactive");
    return StarterGuideVideosRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await StarterGuideVideosRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide video not found");
    if (existing.isActive)
      throw new ForbiddenError("Starter guide video is already active");
    return StarterGuideVideosRepository.updateById(id, { isActive: true });
  }
}
