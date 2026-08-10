import { NotFoundError } from "@/shared/errors";
import { FeeStructureRepository } from "../repositories/fee-structure.repository";
import type {
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
} from "../validators/fee-structure.validator";

type FeeStructureRow = NonNullable<
  Awaited<ReturnType<typeof FeeStructureRepository.findById>>
>;

function toDto(row: FeeStructureRow) {
  return {
    ...row,
    amount: row.amount.toString(),
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
  };
}

async function assertCourseInCollege(courseId: string, collegeId: string) {
  const course = await FeeStructureRepository.findCourseInCollege(
    courseId,
    collegeId,
  );
  if (!course) throw new NotFoundError("Course not found");
}

export class FeeStructureService {
  static async listForCourse(courseId: string, collegeId: string) {
    await assertCourseInCollege(courseId, collegeId);
    const rows = await FeeStructureRepository.findByCourseId(courseId);
    return rows.map(toDto);
  }

  static async create(
    courseId: string,
    collegeId: string,
    data: CreateFeeStructureInput,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const row = await FeeStructureRepository.create({
      courseId,
      collegeId,
      academicYear: data.academicYear,
      feeCategory: data.feeCategory,
      amount: data.amount,
      yearOrSemester: data.yearOrSemester ?? null,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      gender: data.gender ?? "both",
      instalmentAllowed: data.instalmentAllowed ?? false,
      instalmentConfig: data.instalmentConfig ?? {},
      feePdfUrl: data.feePdfUrl ?? null,
    });
    return toDto(row);
  }

  static async update(
    courseId: string,
    collegeId: string,
    feeStructureId: string,
    data: UpdateFeeStructureInput,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const updateData: Record<string, unknown> = {};
    if (data.academicYear !== undefined)
      updateData.academicYear = data.academicYear;
    if (data.feeCategory !== undefined)
      updateData.feeCategory = data.feeCategory;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.yearOrSemester !== undefined)
      updateData.yearOrSemester = data.yearOrSemester;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.instalmentAllowed !== undefined)
      updateData.instalmentAllowed = data.instalmentAllowed;
    if (data.instalmentConfig !== undefined)
      updateData.instalmentConfig = data.instalmentConfig;
    if (data.feePdfUrl !== undefined) updateData.feePdfUrl = data.feePdfUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const row = await FeeStructureRepository.update(
      courseId,
      feeStructureId,
      updateData,
    );
    if (!row) throw new NotFoundError("Fee structure not found");
    return toDto(row);
  }

  static async remove(
    courseId: string,
    collegeId: string,
    feeStructureId: string,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const row = await FeeStructureRepository.softDeleteById(
      courseId,
      feeStructureId,
    );
    if (!row) throw new NotFoundError("Fee structure not found");
    return toDto(row);
  }
}
