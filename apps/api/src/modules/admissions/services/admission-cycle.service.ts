import { ConflictError, NotFoundError } from "@/shared/errors";
import { AdmissionCycleRepository } from "../repositories/admission-cycle.repository";
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
}
