import { prisma } from "@beaconu/db";

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
    select: {
      id: true,
      name: true,
      slug: true,
    },
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

export class AcademicTaxonomyRepository {
  static async listStreams(filters: { isActive?: boolean } = {}) {
    return prisma.stream.findMany({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
      },
      select: STREAM_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findStreamById(id: string) {
    return prisma.stream.findUnique({
      where: { id },
      select: STREAM_SELECT,
    });
  }

  static async findStreamByName(name: string) {
    return prisma.stream.findUnique({
      where: { name },
      select: STREAM_SELECT,
    });
  }

  static async findStreamBySlug(slug: string) {
    return prisma.stream.findUnique({
      where: { slug },
      select: STREAM_SELECT,
    });
  }

  static async createStream(data: {
    name: string;
    slug: string;
    logoUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }) {
    return prisma.stream.create({
      data,
      select: STREAM_SELECT,
    });
  }

  static async updateStreamById(
    id: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.stream.update({
      where: { id },
      data,
      select: STREAM_SELECT,
    });
  }

  static async listDisciplines(
    filters: { isActive?: boolean; streamId?: string } = {},
  ) {
    return prisma.discipline.findMany({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
        ...(filters.streamId ? { streamId: filters.streamId } : {}),
      },
      select: DISCIPLINE_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findDisciplineById(id: string) {
    return prisma.discipline.findUnique({
      where: { id },
      select: DISCIPLINE_SELECT,
    });
  }

  static async findDisciplineByStreamAndSlug(streamId: string, slug: string) {
    return prisma.discipline.findUnique({
      where: {
        uq_discipline_slug: { streamId, slug },
      },
      select: DISCIPLINE_SELECT,
    });
  }

  static async createDiscipline(data: {
    streamId: string;
    name: string;
    slug: string;
    logoUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }) {
    return prisma.discipline.create({
      data,
      select: DISCIPLINE_SELECT,
    });
  }

  static async updateDisciplineById(
    id: string,
    data: {
      streamId?: string;
      name?: string;
      slug?: string;
      logoUrl?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.discipline.update({
      where: { id },
      data,
      select: DISCIPLINE_SELECT,
    });
  }

  static async listStudyLevels(filters: { isActive?: boolean } = {}) {
    return prisma.studyLevel.findMany({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
      },
      select: STUDY_LEVEL_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findStudyLevelById(id: string) {
    return prisma.studyLevel.findUnique({
      where: { id },
      select: STUDY_LEVEL_SELECT,
    });
  }

  static async findStudyLevelByName(name: string) {
    return prisma.studyLevel.findUnique({
      where: { name },
      select: STUDY_LEVEL_SELECT,
    });
  }

  static async findStudyLevelBySlug(slug: string) {
    return prisma.studyLevel.findUnique({
      where: { slug },
      select: STUDY_LEVEL_SELECT,
    });
  }

  static async createStudyLevel(data: {
    name: string;
    slug: string;
    logoUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }) {
    return prisma.studyLevel.create({
      data,
      select: STUDY_LEVEL_SELECT,
    });
  }

  static async updateStudyLevelById(
    id: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.studyLevel.update({
      where: { id },
      data,
      select: STUDY_LEVEL_SELECT,
    });
  }

  static async listProgramTypes(filters: { isActive?: boolean } = {}) {
    return prisma.programType.findMany({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
      },
      select: PROGRAM_TYPE_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findProgramTypeById(id: string) {
    return prisma.programType.findUnique({
      where: { id },
      select: PROGRAM_TYPE_SELECT,
    });
  }

  static async findProgramTypeByName(name: string) {
    return prisma.programType.findUnique({
      where: { name },
      select: PROGRAM_TYPE_SELECT,
    });
  }

  static async findProgramTypeBySlug(slug: string) {
    return prisma.programType.findUnique({
      where: { slug },
      select: PROGRAM_TYPE_SELECT,
    });
  }

  static async createProgramType(data: {
    name: string;
    slug: string;
    logoUrl?: string;
    sortOrder: number;
    isActive: boolean;
  }) {
    return prisma.programType.create({
      data,
      select: PROGRAM_TYPE_SELECT,
    });
  }

  static async updateProgramTypeById(
    id: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.programType.update({
      where: { id },
      data,
      select: PROGRAM_TYPE_SELECT,
    });
  }
}
