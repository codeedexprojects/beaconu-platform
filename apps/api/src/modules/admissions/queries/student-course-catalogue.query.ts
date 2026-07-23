import { prisma } from "@beaconu/db";

function mapRow(row: {
  id: string;
  applicationFee: { toString(): string };
  course: { id: string; name: string; code: string };
}) {
  return {
    courseId: row.course.id,
    courseName: row.course.name,
    courseCode: row.course.code,
    applicationFee: row.applicationFee.toString(),
  };
}

export class StudentCourseCatalogueQuery {
  /** Lean course listing for an admission cycle — no quota data, that's
   * fetched per-course once the student picks one (see the existing
   * quota-options endpoint). Used for the "Add Course" browse/search page,
   * distinct from the payment-summary page which shows only courses
   * already added to the application. */
  static async listForCycle(admissionCycleId: string, search?: string) {
    const rows = await prisma.admissionCycleCourse.findMany({
      where: {
        admissionCycleId,
        isActive: true,
        ...(search && {
          course: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          },
        }),
      },
      select: {
        id: true,
        applicationFee: true,
        course: { select: { id: true, name: true, code: true } },
      },
      orderBy: { course: { name: "asc" } },
    });
    return rows.map(mapRow);
  }
}
