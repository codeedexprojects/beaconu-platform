import { prisma } from "@beaconu/db";
import { canonicalIndiaState } from "@beaconu/utils";

export interface PublicCollegeFilterInput {
  universityId?: string;
  streamId?: string;
  disciplineId?: string;
  studyLevelId?: string;
  programTypeId?: string;
  courseMasterId?: string;
  courseName?: string;
  state?: string;
  district?: string;
  city?: string;
}

/** College-level rules for the public explore list: which colleges are
 * visible at all, plus location/university filters. */
function collegeCriteria(filters: PublicCollegeFilterInput) {
  return {
    status: "active",
    settings: { path: ["isListed"], equals: true },
    ...(filters.universityId && { universityId: filters.universityId }),
    ...(filters.state && {
      state: { equals: filters.state, mode: "insensitive" as const },
    }),
    ...(filters.district && {
      district: { equals: filters.district, mode: "insensitive" as const },
    }),
    ...(filters.city && {
      city: { equals: filters.city, mode: "insensitive" as const },
    }),
  };
}

/** Course-level rules. Kept in one object so a single course has to satisfy
 * every selected criterion — not one course for the discipline and another
 * for the study level. */
function courseCriteria(filters: PublicCollegeFilterInput) {
  return {
    status: "active",
    ...(!filters.disciplineId &&
      filters.streamId && { discipline: { streamId: filters.streamId } }),
    ...(filters.disciplineId && { disciplineId: filters.disciplineId }),
    ...(filters.studyLevelId && { studyLevelId: filters.studyLevelId }),
    ...(filters.programTypeId && { programTypeId: filters.programTypeId }),
    ...(filters.courseMasterId && { courseMasterId: filters.courseMasterId }),
    // Name matching is the fallback for courses not linked to the catalogue;
    // linked courses are reached through courseMasterId instead.
    ...(filters.courseName &&
      !filters.courseMasterId && {
        name: { equals: filters.courseName, mode: "insensitive" as const },
        courseMasterId: null,
      }),
  };
}

function hasCourseFilter(filters: PublicCollegeFilterInput) {
  return Boolean(
    filters.streamId ||
    filters.disciplineId ||
    filters.studyLevelId ||
    filters.programTypeId ||
    filters.courseMasterId ||
    filters.courseName,
  );
}

export class PublicCollegeFilterQuery {
  /** The `where` for GET /public/colleges. Shared with listCourseOptions so a
   * course offered on the filter screen always returns at least one college. */
  static buildCollegeListWhere(filters: PublicCollegeFilterInput) {
    return {
      ...collegeCriteria(filters),
      ...(hasCourseFilter(filters) && {
        courses: { some: courseCriteria(filters) },
      }),
    };
  }

  /** State options (or, when `state` is given, district options within it)
   * for the filter flow, narrowed by every other selected filter.
   *
   * Only values stored without stray whitespace are offered, because the
   * results filter matches exactly; that keeps `collegeCount` equal to what
   * GET /public/colleges returns for the same option. */
  static async listLocationOptions(
    filters: Omit<PublicCollegeFilterInput, "district" | "city">,
  ) {
    const colleges = await prisma.college.findMany({
      where: this.buildCollegeListWhere(filters),
      select: { state: true, district: true },
    });

    const counts = new Map<string, { name: string; collegeCount: number }>();
    for (const college of colleges) {
      const name = filters.state
        ? college.district
        : canonicalIndiaState(college.state) && college.state;
      if (!name || name !== name.trim()) continue;
      const key = name.toLowerCase();
      const entry = counts.get(key);
      if (entry) {
        entry.collegeCount++;
      } else {
        counts.set(key, {
          name: filters.state ? name : canonicalIndiaState(name)!,
          collegeCount: 1,
        });
      }
    }

    return [...counts.values()]
      .sort(
        (a, b) =>
          b.collegeCount - a.collegeCount || a.name.localeCompare(b.name),
      )
      .map(({ name, collegeCount }) =>
        filters.state
          ? { district: name, collegeCount }
          : { state: name, collegeCount },
      );
  }

  /** Course options for the filter-flow screen, narrowed by the earlier steps.
   *
   * Courses linked to a catalogue entry are grouped under it, so different
   * college titles for the same programme become one option; the app passes
   * `courseMasterId`. Courses not yet linked fall back to grouping by name
   * (case-insensitive) and the app passes `courseName`. */
  static async listCourseOptions(
    filters: Omit<PublicCollegeFilterInput, "courseName" | "courseMasterId"> & {
      search?: string;
    },
  ) {
    const courses = await prisma.course.findMany({
      where: {
        ...courseCriteria(filters),
        ...(filters.search && {
          OR: [
            {
              name: { contains: filters.search, mode: "insensitive" as const },
            },
            {
              courseMaster: {
                name: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }),
        college: collegeCriteria(filters),
      },
      select: {
        name: true,
        collegeId: true,
        courseMaster: { select: { id: true, name: true } },
        discipline: {
          select: { logoUrl: true, stream: { select: { logoUrl: true } } },
        },
      },
    });

    const groups = new Map<
      string,
      {
        courseMasterId: string | null;
        masterName: string | null;
        spellings: Map<string, number>;
        collegeIds: Set<string>;
        logoUrl: string | null;
      }
    >();

    for (const course of courses) {
      const name = course.name.trim();
      const key = course.courseMaster
        ? `master:${course.courseMaster.id}`
        : `name:${name.toLowerCase()}`;
      const group = groups.get(key) ?? {
        courseMasterId: course.courseMaster?.id ?? null,
        masterName: course.courseMaster?.name ?? null,
        spellings: new Map<string, number>(),
        collegeIds: new Set<string>(),
        logoUrl: null,
      };
      group.spellings.set(name, (group.spellings.get(name) ?? 0) + 1);
      group.collegeIds.add(course.collegeId);
      group.logoUrl ??=
        course.discipline.logoUrl ?? course.discipline.stream.logoUrl ?? null;
      groups.set(key, group);
    }

    return [...groups.values()]
      .map((group) => {
        // Most common spelling wins; ties break alphabetically.
        const [commonName] = [...group.spellings.entries()].sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        )[0];
        return {
          courseMasterId: group.courseMasterId,
          name: group.masterName ?? commonName,
          collegeCount: group.collegeIds.size,
          logoUrl: group.logoUrl,
        };
      })
      .sort(
        (a, b) =>
          b.collegeCount - a.collegeCount || a.name.localeCompare(b.name),
      );
  }
}
