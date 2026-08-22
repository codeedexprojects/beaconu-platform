import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { StarterGuideRepository } from "../repositories/starter-guide.repository";
import {
  CreateStarterGuideInput,
  UpdateStarterGuideInput,
} from "../validators/starter-guide.validator";

export class StarterGuideService {
  static async create(data: CreateStarterGuideInput) {
    return StarterGuideRepository.create({
      title: data.title,
      description: data.description ?? null,
      thumbnailUrl: data.thumbnail_url,
      videoUrl: data.video_url,
      steps: data.steps,
      displayOrder: data.display_order ?? 0,
    });
  }

  static async update(id: string, data: UpdateStarterGuideInput) {
    const existing = await StarterGuideRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide not found");

    return StarterGuideRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.thumbnail_url !== undefined
        ? { thumbnailUrl: data.thumbnail_url }
        : {}),
      ...(data.video_url !== undefined ? { videoUrl: data.video_url } : {}),
      ...(data.steps !== undefined ? { steps: data.steps } : {}),
      ...(data.display_order !== undefined
        ? { displayOrder: data.display_order }
        : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await StarterGuideRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide not found");
    if (!existing.isActive)
      throw new ForbiddenError("Starter guide is already inactive");
    return StarterGuideRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await StarterGuideRepository.findById(id);
    if (!existing) throw new NotFoundError("Starter guide not found");
    if (existing.isActive)
      throw new ForbiddenError("Starter guide is already active");
    return StarterGuideRepository.updateById(id, { isActive: true });
  }
}
