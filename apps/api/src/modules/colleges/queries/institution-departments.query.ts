import { prisma } from "@beaconu/db";

function humanizeStudyMode(studyMode: string): string {
  return studyMode
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function minActiveFee(feeStructures: { amount: unknown }[]): string | null {
  const amounts = feeStructures
    .map((fs) => Number(fs.amount))
    .filter((n) => Number.isFinite(n));
  if (amounts.length === 0) return null;
  return String(Math.min(...amounts));
}

export class InstitutionDepartmentsQuery {
  static async getDepartmentsWithCoursesForCollege(collegeId: string) {
    const courses = await prisma.course.findMany({
      where: { collegeId, status: "active" },
      select: {
        id: true,
        name: true,
        duration: true,
        studyMode: true,
        discipline: { select: { id: true, name: true } },
        programType: { select: { name: true } },
        feeStructures: {
          where: { isActive: true },
          select: { amount: true },
        },
      },
    });

    const groupsByDisciplineId = new Map<
      string,
      { id: string; name: string; courses: typeof courses }
    >();

    for (const course of courses) {
      const key = course.discipline.id;
      if (!groupsByDisciplineId.has(key)) {
        groupsByDisciplineId.set(key, {
          id: course.discipline.id,
          name: course.discipline.name,
          courses: [],
        });
      }
      groupsByDisciplineId.get(key)!.courses.push(course);
    }

    return Array.from(groupsByDisciplineId.values()).map((group) => {
      const formattedCourses = group.courses.map((course) => ({
        id: course.id,
        name: course.name,
        duration: course.duration,
        mode: humanizeStudyMode(course.studyMode),
        fee: minActiveFee(course.feeStructures),
        currency: "INR",
      }));

      const programTypeOptions = Array.from(
        new Set(group.courses.map((course) => course.programType.name)),
      );

      return {
        id: group.id,
        name: group.name,
        programs_available: formattedCourses.length,
        expanded: formattedCourses.length > 0,
        program_type_tabs: {
          selected: programTypeOptions[0] ?? "",
          options: programTypeOptions,
        },
        courses: formattedCourses,
      };
    });
  }
}
