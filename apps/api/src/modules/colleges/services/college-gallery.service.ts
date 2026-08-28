import { NotFoundError } from "@/shared/errors";
import { CollegeGalleryRepository } from "../repositories/college-gallery.repository";
import type { CreateGalleryItemInput } from "../validators/college-gallery.validator";

export class CollegeGalleryService {
  static async list(collegeId: string) {
    return CollegeGalleryRepository.findByCollegeId(collegeId);
  }

  static async create(collegeId: string, body: CreateGalleryItemInput) {
    const count = await CollegeGalleryRepository.countByCollegeId(collegeId);

    return CollegeGalleryRepository.create({
      collegeId,
      mediaType: body.mediaType,
      url: body.url,
      caption: body.caption || null,
      sortOrder: count,
    });
  }

  static async remove(id: string, collegeId: string) {
    const item = await CollegeGalleryRepository.delete(id, collegeId);
    if (!item) throw new NotFoundError("Gallery item not found");
    return item;
  }

  static async reorder(collegeId: string, orderedIds: string[]) {
    await CollegeGalleryRepository.reorder(collegeId, orderedIds);
    return CollegeGalleryRepository.findByCollegeId(collegeId);
  }
}
