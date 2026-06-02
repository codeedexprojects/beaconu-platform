import { prisma } from "@beaconu/db";
import {
  AdminListQuery,
  PublicListQuery,
} from "../validators/academic-taxonomy.validator";

type ListQuery = PublicListQuery | AdminListQuery;

const STREAM_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
} as const;

const DISCIPLINE_SELECT = {
  id: true,
  streamId: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  stream: {
    select: { id: true, name: true, slug: true },
  },
} as const;

const STUDY_LEVEL_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
} as const;

const PROGRAM_TYPE_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
} as const;

function resolveIsActive(filters: ListQuery): boolean | undefined {
  return "is_active" in filters ? filters.is_active : true;
}

function getPublicFields(filters: ListQuery) {
  const university_id =
    "university_id" in filters ? filters.university_id : undefined;
  const discipline_id =
    "discipline_id" in filters ? filters.discipline_id : undefined;
  return { university_id, discipline_id };
}

export class AcademicTaxonomyQuery {
  static async listStreams(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id, discipline_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (university_id || discipline_id) {
      const disciplineWhere: any = {};
      if (discipline_id) disciplineWhere.id = discipline_id;
      if (university_id) {
        disciplineWhere.courses = {
          some: {
            status: "active",
            college: { universityId: university_id, status: "active" },
          },
        };
      }
      whereClause.disciplines = { some: disciplineWhere };
    }

    const [data, total] = await Promise.all([
      prisma.stream.findMany({
        where: whereClause,
        select: STREAM_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
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

  static async listDisciplines(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.stream_id) {
      whereClause.streamId = filters.stream_id;
    }

    if (university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: { universityId: university_id, status: "active" },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.discipline.findMany({
        where: whereClause,
        select: DISCIPLINE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
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

  static async listStudyLevels(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: { universityId: university_id, status: "active" },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.studyLevel.findMany({
        where: whereClause,
        select: STUDY_LEVEL_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
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

  static async listProgramTypes(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (university_id) {
      whereClause.courses = {
        some: {
          status: "active",
          college: { universityId: university_id, status: "active" },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.programType.findMany({
        where: whereClause,
        select: PROGRAM_TYPE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
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
