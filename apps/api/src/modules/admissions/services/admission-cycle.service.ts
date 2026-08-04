import { ConflictError, NotFoundError } from "@/shared/errors";
import { AdmissionCycleRepository } from "../repositories/admission-cycle.repository";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import { TemplateService } from "@/modules/assessments/services/template.service";
import type {
  CreateAdmissionCycleInput,
  UpdateAdmissionCycleInput,
} from "../validators/admission-cycle.validator";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export class AdmissionCycleService {
  static async create(collegeId: string, data: CreateAdmissionCycleInput) {
    if (data.assessment_template_id) {
      await TemplateService.getForCollege(
        collegeId,
        data.assessment_template_id,
      );
    }
    try {
      return await AdmissionCycleRepository.create(collegeId, data);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          "An application form with this name already exists for your college",
        );
      }
      throw error;
    }
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const cycle = await AdmissionCycleRepository.findById(id);
    if (!cycle || cycle.collegeId !== collegeId) {
      throw new NotFoundError("Application form not found");
    }
    return cycle;
  }

  static async update(
    id: string,
    collegeId: string,
    data: UpdateAdmissionCycleInput,
  ) {
    await this.loadForCollege(id, collegeId);
    if (data.assessment_template_id) {
      await TemplateService.getForCollege(
        collegeId,
        data.assessment_template_id,
      );
    }
    try {
      return await AdmissionCycleRepository.update(id, data);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          "An application form with this name already exists for your college",
        );
      }
      throw error;
    }
  }

  static async remove(id: string, collegeId: string) {
    await this.loadForCollege(id, collegeId);
    return AdmissionCycleRepository.archive(id);
  }

  static async getCourseIdsWithActiveForm(
    courseIds: string[],
  ): Promise<string[]> {
    return AdmissionCycleQuery.findCourseIdsWithActiveOpenCycle(courseIds);
  }
}
