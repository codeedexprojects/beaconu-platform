import { NotFoundError, ValidationError } from "@/shared/errors";
import { MediaKitRepository } from "../repositories/media-kit.repository";
import type {
  CreateMediaKitInput,
  UpdateMediaKitInput,
} from "../validators/media-kit.validator";

export class MediaKitService {
  static async create(collegeId: string, data: CreateMediaKitInput) {
    let courseId: string | null = null;
    if (data.scope === "course_specific") {
      const exists = await MediaKitRepository.courseExistsInCollege(
        data.course_id!,
        collegeId,
      );
      if (!exists) {
        throw new ValidationError(
          "Selected course does not belong to this college",
        );
      }
      courseId = data.course_id!;
    }

    return MediaKitRepository.create(collegeId, {
      title: data.title,
      assetType: data.asset_type,
      scope: data.scope,
      courseId,
      fileUrl: data.file_url,
      fileName: data.file_name ?? null,
      fileSizeBytes: data.file_size_bytes ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
      sortOrder: data.sort_order ?? 0,
    });
  }

  static async update(
    id: string,
    collegeId: string,
    data: UpdateMediaKitInput,
  ) {
    const updated = await MediaKitRepository.update(id, collegeId, {
      title: data.title,
      sortOrder: data.sort_order,
      isActive: data.is_active,
      thumbnailUrl: data.thumbnail_url,
    });
    if (!updated) throw new NotFoundError("Media kit item not found");
    return updated;
  }

  static async remove(id: string, collegeId: string) {
    const removed = await MediaKitRepository.softDeleteById(id, collegeId);
    if (!removed) throw new NotFoundError("Media kit item not found");
    return removed;
  }
}
