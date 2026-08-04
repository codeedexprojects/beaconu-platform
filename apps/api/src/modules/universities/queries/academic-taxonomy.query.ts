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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function extractUniversityStreamIds(metadata: unknown): string[] {
  if (!isRecord(metadata)) return [];
  const overview = isRecord(metadata.overview) ? metadata.overview : undefined;
  if (!overview) return [];

  const raw = Array.isArray(overview.streams)
    ? overview.streams
    : Array.isArray(overview.discipline)
      ? overview.discipline
      : [];

  return Array.from(
    new Set(
      raw
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (!isRecord(item)) return "";
          const candidate =
            (typeof item.id === "string" && item.id) ||
            (typeof item.streamId === "string" && item.streamId) ||
            (typeof item.stream_id === "string" && item.stream_id) ||
            "";
          return candidate.trim();
        })
        .filter((id) => id.length > 0),
    ),
  );
}

export class AcademicTaxonomyQuery {
  static async listStreams(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id, discipline_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};
    let selectedUniversityStreamIds: string[] = [];

    if (university_id) {
      const university = await prisma.university.findUnique({
        where: { id: university_id },
        select: { metadata: true },
      });
      selectedUniversityStreamIds = extractUniversityStreamIds(
        university?.metadata,
      );
    }

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (selectedUniversityStreamIds.length > 0) {
      whereClause.id = { in: selectedUniversityStreamIds };
      if (discipline_id) {
        whereClause.disciplines = { some: { id: discipline_id } };
      }
    } else if (university_id || discipline_id) {
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

  static async listStreamsForPublic(filters: PublicListQuery) {
    const { data: streams, meta } = await this.listStreams(filters);

    const courseCounts = await Promise.all(
      streams.map((s) =>
        prisma.course.count({
          where: { status: "active", discipline: { streamId: s.id } },
        }),
      ),
    );

    const skip = (meta.page - 1) * meta.limit;

    return {
      data: streams.map((s, idx) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        logoUrl: s.logoUrl,
        course_count: courseCounts[idx],
      })),
      meta: {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        hasNext: skip + meta.limit < meta.total,
      },
    };
  }

  static async listDisciplines(filters: ListQuery) {
    const isActive = resolveIsActive(filters);
    const { university_id } = getPublicFields(filters);
    const whereClause: any = isActive !== undefined ? { isActive } : {};
    let selectedUniversityStreamIds: string[] = [];

    if (university_id) {
      const university = await prisma.university.findUnique({
        where: { id: university_id },
        select: { metadata: true },
      });
      selectedUniversityStreamIds = extractUniversityStreamIds(
        university?.metadata,
      );
    }

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.stream_id) {
      whereClause.streamId = filters.stream_id;
    }

    if (selectedUniversityStreamIds.length > 0) {
      if (filters.stream_id) {
        whereClause.streamId = selectedUniversityStreamIds.includes(
          filters.stream_id,
        )
          ? filters.stream_id
          : "__none__";
      } else {
        whereClause.streamId = { in: selectedUniversityStreamIds };
      }
    } else if (university_id) {
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
