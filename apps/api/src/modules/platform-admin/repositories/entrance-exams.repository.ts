import { prisma } from "@beaconu/db";

const EXAM_SELECT = {
  id: true,
  name: true,
  code: true,
  conductingBody: true,
  examLevel: true,
  applicableCourses: true,
  eligibility: true,
  description: true,
  registrationStart: true,
  registrationEnd: true,
  examDate: true,
  resultDate: true,
  officialWebsite: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class EntranceExamsRepository {
  static async findById(id: string) {
    return prisma.entranceExam.findUnique({
      where: { id },
      select: EXAM_SELECT,
    });
  }

  static async findByCode(code: string) {
    return prisma.entranceExam.findUnique({
      where: { code },
      select: EXAM_SELECT,
    });
  }

  static async create(data: {
    name: string;
    code: string;
    conductingBody?: string | null;
    examLevel: string;
    applicableCourses?: string[];
    eligibility?: string | null;
    description?: string | null;
    registrationStart?: Date | null;
    registrationEnd?: Date | null;
    examDate?: Date | null;
    resultDate?: Date | null;
    officialWebsite?: string | null;
    status: string;
    createdBy?: string | null;
  }) {
    return prisma.entranceExam.create({ data, select: EXAM_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      name?: string;
      code?: string;
      conductingBody?: string | null;
      examLevel?: string;
      applicableCourses?: string[];
      eligibility?: string | null;
      description?: string | null;
      registrationStart?: Date | null;
      registrationEnd?: Date | null;
      examDate?: Date | null;
      resultDate?: Date | null;
      officialWebsite?: string | null;
      status?: string;
    },
  ) {
    return prisma.entranceExam.update({
      where: { id },
      data,
      select: EXAM_SELECT,
    });
  }

  static async softDeleteById(id: string) {
    return prisma.entranceExam.update({
      where: { id },
      data: { status: "inactive" },
      select: EXAM_SELECT,
    });
  }
}
