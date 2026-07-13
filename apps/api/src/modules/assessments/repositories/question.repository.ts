import { prisma, Prisma } from "@beaconu/db";
import type { CreateQuestionInput, QuestionContent } from "@beaconu/types";

export class QuestionRepository {
  static async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: { courseMappings: true },
    });
  }

  static async create(
    collegeId: string,
    sectionId: string,
    data: CreateQuestionInput,
    parentQuestionId?: string,
    version = 1,
  ) {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          collegeId,
          sectionId,
          questionTypeId: data.question_type_id,
          difficulty: data.difficulty,
          title: data.title ?? null,
          content: data.content as unknown as Prisma.InputJsonValue,
          answerKey: data.answer_key
            ? (data.answer_key as unknown as Prisma.InputJsonValue)
            : undefined,
          marks: data.marks,
          negativeMarks: data.negative_marks ?? 0,
          version,
          parentQuestionId: parentQuestionId ?? null,
        },
      });

      if (data.course_ids && data.course_ids.length > 0) {
        await tx.questionCourseMapping.createMany({
          data: data.course_ids.map((courseId) => ({
            questionId: question.id,
            courseId,
          })),
        });
      }

      return question;
    });
  }

  static async archive(id: string) {
    return prisma.question.update({
      where: { id },
      data: { status: "archived" },
    });
  }

  static async softDeactivate(id: string) {
    return prisma.question.update({
      where: { id },
      data: { status: "inactive" },
    });
  }

  static async listBySection(
    collegeId: string,
    sectionId: string,
    filters: {
      question_type_id?: string;
      difficulty?: string;
      status?: string;
      course_id?: string;
    },
  ) {
    return prisma.question.findMany({
      where: {
        collegeId,
        sectionId,
        ...(filters.question_type_id && {
          questionTypeId: filters.question_type_id,
        }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        status: filters.status ?? "active",
        ...(filters.course_id && {
          courseMappings: { some: { courseId: filters.course_id } },
        }),
      },
      include: { courseMappings: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listActivePoolForSection(
    collegeId: string,
    sectionId: string,
    courseId?: string,
    excludeIds: string[] = [],
  ) {
    return prisma.question.findMany({
      where: {
        collegeId,
        sectionId,
        status: "active",
        ...(courseId && {
          courseMappings: { some: { courseId } },
        }),
        ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
      },
    });
  }

  static async findByIds(collegeId: string, ids: string[]) {
    return prisma.question.findMany({
      where: { collegeId, id: { in: ids }, status: "active" },
    });
  }
}

export type { QuestionContent };
