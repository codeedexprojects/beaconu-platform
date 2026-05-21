import { NotFoundError, ConflictError } from "@/shared/errors";
import { EntranceExamsRepository } from "../repositories/entrance-exams.repository";
import {
  CreateEntranceExamInput,
  UpdateEntranceExamInput,
} from "../validators/entrance-exams.validator";

export class EntranceExamsService {
  static async create(data: CreateEntranceExamInput, adminId: string) {
    const existing = await EntranceExamsRepository.findByCode(data.code);
    if (existing)
      throw new ConflictError(`Exam with code '${data.code}' already exists`);

    return EntranceExamsRepository.create({
      name: data.name,
      code: data.code,
      conductingBody: data.conducting_body ?? null,
      examLevel: data.exam_level,
      applicableCourses: data.applicable_courses ?? [],
      eligibility: data.eligibility ?? null,
      description: data.description ?? null,
      registrationStart: data.registration_start
        ? new Date(data.registration_start)
        : null,
      registrationEnd: data.registration_end
        ? new Date(data.registration_end)
        : null,
      examDate: data.exam_date ? new Date(data.exam_date) : null,
      resultDate: data.result_date ? new Date(data.result_date) : null,
      officialWebsite: data.official_website ?? null,
      status: "active",
      createdBy: adminId,
    });
  }

  static async update(id: string, data: UpdateEntranceExamInput) {
    const existing = await EntranceExamsRepository.findById(id);
    if (!existing) throw new NotFoundError("Entrance exam not found");

    if (data.code && data.code !== existing.code) {
      const codeConflict = await EntranceExamsRepository.findByCode(data.code);
      if (codeConflict)
        throw new ConflictError(`Exam with code '${data.code}' already exists`);
    }

    return EntranceExamsRepository.updateById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.conducting_body !== undefined
        ? { conductingBody: data.conducting_body }
        : {}),
      ...(data.exam_level !== undefined ? { examLevel: data.exam_level } : {}),
      ...(data.applicable_courses !== undefined
        ? { applicableCourses: data.applicable_courses }
        : {}),
      ...(data.eligibility !== undefined
        ? { eligibility: data.eligibility }
        : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.registration_start !== undefined
        ? {
            registrationStart: data.registration_start
              ? new Date(data.registration_start)
              : null,
          }
        : {}),
      ...(data.registration_end !== undefined
        ? {
            registrationEnd: data.registration_end
              ? new Date(data.registration_end)
              : null,
          }
        : {}),
      ...(data.exam_date !== undefined
        ? { examDate: data.exam_date ? new Date(data.exam_date) : null }
        : {}),
      ...(data.result_date !== undefined
        ? { resultDate: data.result_date ? new Date(data.result_date) : null }
        : {}),
      ...(data.official_website !== undefined
        ? { officialWebsite: data.official_website }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await EntranceExamsRepository.findById(id);
    if (!existing) throw new NotFoundError("Entrance exam not found");
    return EntranceExamsRepository.softDeleteById(id);
  }
}
