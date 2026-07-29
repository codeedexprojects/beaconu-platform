import { prisma } from "@beaconu/db";
import type {
  CreateAdmissionCycleInput,
  UpdateAdmissionCycleInput,
} from "../validators/admission-cycle.validator";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class AdmissionCycleRepository {
  static async create(collegeId: string, data: CreateAdmissionCycleInput) {
    return prisma.admissionCycle.create({
      data: {
        collegeId,
        applicationType: data.application_type,
        name: data.name,
        slug: slugify(data.name),
        admissionYear: data.admission_year,
        programLevel: data.program_level,
        startsOn: data.starts_on,
        endsOn: data.ends_on ?? null,
        assessmentRequired: data.assessment_required ?? false,
        assessmentTemplateId: data.assessment_template_id ?? null,
      },
    });
  }

  static async findById(id: string) {
    return prisma.admissionCycle.findUnique({ where: { id } });
  }

  static async update(id: string, data: UpdateAdmissionCycleInput) {
    return prisma.admissionCycle.update({
      where: { id },
      data: {
        ...(data.application_type !== undefined && {
          applicationType: data.application_type,
        }),
        ...(data.name !== undefined && {
          name: data.name,
          slug: slugify(data.name),
        }),
        ...(data.admission_year !== undefined && {
          admissionYear: data.admission_year,
        }),
        ...(data.program_level !== undefined && {
          programLevel: data.program_level,
        }),
        ...(data.starts_on !== undefined && { startsOn: data.starts_on }),
        ...(data.ends_on !== undefined && { endsOn: data.ends_on }),
        ...(data.assessment_required !== undefined && {
          assessmentRequired: data.assessment_required,
        }),
        ...(data.assessment_template_id !== undefined && {
          assessmentTemplateId: data.assessment_template_id,
        }),
      },
    });
  }

  static async archive(id: string) {
    return prisma.admissionCycle.update({
      where: { id },
      data: { status: "archived" },
    });
  }
}
