import { prisma } from "@beaconu/db";
import { PublicListQuery } from "../validators/academic-taxonomy.validator";

const STREAM_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
} as const;

const DISCIPLINE_SELECT = {
  id: true,
  streamId: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
} as const;

const STUDY_LEVEL_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
} as const;

const PROGRAM_TYPE_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
} as const;

export class AcademicTaxonomyQuery {
  static async listStreams(filters: PublicListQuery) {
    const whereClause: any = { isActive: true };

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.university_id || filters.discipline_id) {
      const disciplineWhere: any = {};

      if (filters.discipline_id) {
        disciplineWhere.id = filters.discipline_id;
      }

      if (filters.university_id) {
        disciplineWhere.courses = {
          some: {
            status: "active",
            college: {
              universityId: filters.university_id,
              status: "active",
            },
          },
        };
      }

      whereClause.disciplines = {
        some: disciplineWhere,
      };
    }

    const [data, total] = await Promise.all([
      prisma.stream.findMany({
        where: whereClause,
        select: STREAM_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.stream.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  static async listDisciplines(filters: PublicListQuery) {
    const whereClause: any = { isActive: true };

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.stream_id) {
      whereClause.streamId = filters.stream_id;
    }

    if (filters.university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: {
            universityId: filters.university_id,
            status: "active",
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.discipline.findMany({
        where: whereClause,
        select: DISCIPLINE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.discipline.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  static async listStudyLevels(filters: PublicListQuery) {
    const whereClause: any = { isActive: true };

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: {
            universityId: filters.university_id,
            status: "active",
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.studyLevel.findMany({
        where: whereClause,
        select: STUDY_LEVEL_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.studyLevel.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  static async listProgramTypes(filters: PublicListQuery) {
    const whereClause: any = { isActive: true };

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: {
            universityId: filters.university_id,
            status: "active",
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.programType.findMany({
        where: whereClause,
        select: PROGRAM_TYPE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.programType.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }
}
