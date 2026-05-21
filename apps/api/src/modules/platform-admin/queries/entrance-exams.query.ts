import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListEntranceExamsQuery } from "../validators/entrance-exams.validator";

const EXAM_LIST_SELECT = {
  id: true,
  name: true,
  code: true,
  conductingBody: true,
  examLevel: true,
  applicableCourses: true,
  examDate: true,
  registrationEnd: true,
  officialWebsite: true,
  status: true,
  createdAt: true,
} as const;

const EXAM_DETAIL_SELECT = {
  ...EXAM_LIST_SELECT,
  eligibility: true,
  description: true,
  registrationStart: true,
  resultDate: true,
  createdBy: true,
  updatedAt: true,
} as const;

export class EntranceExamQuery {
  static async listAll(filters: ListEntranceExamsQuery) {
    const { page, limit, status, exam_level, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(exam_level ? { examLevel: exam_level } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.entranceExam.findMany({
        where,
        select: EXAM_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.entranceExam.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getById(id: string) {
    const exam = await prisma.entranceExam.findUnique({
      where: { id },
      select: EXAM_DETAIL_SELECT,
    });
    if (!exam) throw new NotFoundError("Entrance exam not found");
    return exam;
  }

  static async listActive(filters: ListEntranceExamsQuery) {
    const { page, limit, exam_level, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "active",
      ...(exam_level ? { examLevel: exam_level } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.entranceExam.findMany({
        where,
        select: EXAM_LIST_SELECT,
        orderBy: [{ examDate: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.entranceExam.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }
}
