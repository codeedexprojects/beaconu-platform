import { prisma, Prisma } from "@beaconu/db";

const EDUCATION_BOARD_SELECT = {
  id: true,
  name: true,
  grade: true,
  slug: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  subjects: {
    select: {
      id: true,
      name: true,
      maxMark: true,
      passMark: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export class EducationBoardsRepository {
  static async listAll(filters: {
    grade?: string;
    isActive?: boolean;
    search?: string;
    page: number;
    limit: number;
  }) {
    const where = {
      ...(filters.grade ? { grade: filters.grade } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" as const } }
        : {}),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.educationBoard.findMany({
        where,
        select: EDUCATION_BOARD_SELECT,
        orderBy: [{ name: "asc" }, { grade: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.educationBoard.count({ where }),
    ]);

    return { rows, total };
  }

  static async findById(id: string) {
    return prisma.educationBoard.findUnique({
      where: { id },
      select: EDUCATION_BOARD_SELECT,
    });
  }

  /** Active board found by id, with its subjects — for the student-facing
   * "get subjects/marks for this board" read. Deliberately separate from
   * findById (which admin uses regardless of isActive, e.g. to reactivate
   * one) — a student should never be able to select/see a deactivated
   * board's details. */
  static async findActiveById(id: string) {
    return prisma.educationBoard.findFirst({
      where: { id, isActive: true },
      select: EDUCATION_BOARD_SELECT,
    });
  }

  /** Names-only, active boards, optionally filtered by grade — for the
   * student-facing board picker. No subjects included (that's a separate,
   * per-board fetch), no pagination (the active board list is small
   * reference data, same reasoning as UniversityType's unpaginated list). */
  static async listActiveNames(
    filters: { grade?: string; search?: string } = {},
  ) {
    return prisma.educationBoard.findMany({
      where: {
        isActive: true,
        ...(filters.grade ? { grade: filters.grade } : {}),
        ...(filters.search
          ? { name: { contains: filters.search, mode: "insensitive" as const } }
          : {}),
      },
      select: { id: true, name: true, grade: true, slug: true },
      orderBy: [{ name: "asc" }, { grade: "asc" }],
    });
  }

  static async findByNameAndGrade(name: string, grade: string) {
    return prisma.educationBoard.findUnique({
      where: { uq_board_name_grade: { name, grade } },
      select: EDUCATION_BOARD_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.educationBoard.findUnique({
      where: { slug },
      select: EDUCATION_BOARD_SELECT,
    });
  }

  /** Board + its subjects created atomically as one nested Prisma write —
   * no explicit $transaction needed here since a nested create is already
   * a single statement. */
  static async create(
    data: { name: string; grade: string; slug: string },
    subjects: { name: string; maxMark: number; passMark: number }[],
  ) {
    return prisma.educationBoard.create({
      data: {
        ...data,
        subjects: {
          createMany: {
            data: subjects.map((s, index) => ({
              name: s.name,
              maxMark: s.maxMark,
              passMark: s.passMark,
              sortOrder: index,
            })),
          },
        },
      },
      select: EDUCATION_BOARD_SELECT,
    });
  }

  static async updateFields(
    tx: Prisma.TransactionClient,
    id: string,
    data: { name?: string; grade?: string; slug?: string; isActive?: boolean },
  ) {
    return tx.educationBoard.update({
      where: { id },
      data,
      select: EDUCATION_BOARD_SELECT,
    });
  }

  /** Wholesale-replace, same pattern as assessments' TemplateRepository
   * section-replace — delete every existing subject row for this board and
   * recreate from the given list, rather than diffing/patching individual
   * subjects. Must be called inside the same $transaction as any sibling
   * updateFields call (the service owns the transaction). */
  static async replaceSubjects(
    tx: Prisma.TransactionClient,
    educationBoardId: string,
    subjects: { name: string; maxMark: number; passMark: number }[],
  ) {
    await tx.educationBoardSubject.deleteMany({
      where: { educationBoardId },
    });
    await tx.educationBoardSubject.createMany({
      data: subjects.map((s, index) => ({
        educationBoardId,
        name: s.name,
        maxMark: s.maxMark,
        passMark: s.passMark,
        sortOrder: index,
      })),
    });
  }
}
