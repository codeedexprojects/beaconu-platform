import { prisma } from "@beaconu/db";
import type {
  AdmissionCycleListQuery,
  StudentAdmissionCycleListQuery,
} from "../validators/admission-cycle.validator";

function mapAdmissionCycle(row: {
  id: string;
  collegeId: string;
  applicationType: string;
  name: string;
  slug: string;
  admissionYear: string;
  programLevel: string;
  startsOn: Date;
  endsOn: Date | null;
  status: string;
  assessmentRequired: boolean;
  assessmentTemplateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    applicationType: row.applicationType,
    name: row.name,
    slug: row.slug,
    admissionYear: row.admissionYear,
    programLevel: row.programLevel,
    startsOn: row.startsOn.toISOString(),
    endsOn: row.endsOn ? row.endsOn.toISOString() : null,
    status: row.status,
    assessmentRequired: row.assessmentRequired,
    assessmentTemplateId: row.assessmentTemplateId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class AdmissionCycleQuery {
  static async listForCollegeAdmin(
    collegeId: string,
    filters: AdmissionCycleListQuery,
  ) {
    const rows = await prisma.admissionCycle.findMany({
      where: {
        collegeId,
        ...(filters.application_type && {
          applicationType: filters.application_type,
        }),
        ...(filters.program_level && { programLevel: filters.program_level }),
        ...(filters.admission_year && {
          admissionYear: filters.admission_year,
        }),
      },
      orderBy: [{ startsOn: "desc" }],
    });
    return rows.map(mapAdmissionCycle);
  }

  static async getByIdForCollegeAdmin(id: string, collegeId: string) {
    const row = await prisma.admissionCycle.findFirst({
      where: { id, collegeId },
    });
    return row ? mapAdmissionCycle(row) : null;
  }

  static async listForStudent(filters: StudentAdmissionCycleListQuery) {
    const rows = await prisma.admissionCycle.findMany({
      where: {
        ...(filters.college_id && { collegeId: filters.college_id }),
        status: "open",
        ...(filters.application_type && {
          applicationType: filters.application_type,
        }),
        ...(filters.program_level && { programLevel: filters.program_level }),
        ...(filters.admission_year && {
          admissionYear: filters.admission_year,
        }),
        ...(filters.course_id && {
          admissionCycleCourses: {
            some: { courseId: filters.course_id, isActive: true },
          },
        }),
      },
      orderBy: [{ startsOn: "desc" }],
    });
    return rows.map(mapAdmissionCycle);
  }

  static async getByIdForStudent(id: string) {
    const row = await prisma.admissionCycle.findFirst({
      where: { id, status: "open" },
    });
    return row ? mapAdmissionCycle(row) : null;
  }

  static async findCourseIdsWithActiveOpenCycle(
    courseIds: string[],
  ): Promise<string[]> {
    if (courseIds.length === 0) return [];
    const now = new Date();
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    const rows = await prisma.admissionCycleCourse.findMany({
      where: {
        courseId: { in: courseIds },
        isActive: true,
        admissionCycle: {
          status: "open",
          startsOn: { lte: now },
          OR: [{ endsOn: null }, { endsOn: { gte: todayMidnight } }],
        },
      },
      select: { courseId: true },
      distinct: ["courseId"],
    });
    return rows.map((r) => r.courseId);
  }
}
