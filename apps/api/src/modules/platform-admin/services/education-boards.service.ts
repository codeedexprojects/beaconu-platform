import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { toSlug } from "@/shared/utils/slug.utils";
import { PaginationHelper } from "@/shared/responses/pagination";
import { EducationBoardsRepository } from "../repositories/education-boards.repository";
import type {
  CreateEducationBoardInput,
  ListEducationBoardsQuery,
  UpdateEducationBoardInput,
} from "../validators/education-boards.validator";

async function ensureUniqueSlug(base: string): Promise<string> {
  const existing = await EducationBoardsRepository.findBySlug(base);
  if (!existing) return base;

  let counter = 2;
  while (true) {
    const candidate = `${base}-${counter}`;
    const taken = await EducationBoardsRepository.findBySlug(candidate);
    if (!taken) return candidate;
    counter++;
  }
}

type BoardRow = NonNullable<
  Awaited<ReturnType<typeof EducationBoardsRepository.findById>>
>;

function toDto(row: BoardRow) {
  return {
    ...row,
    subjects: row.subjects.map((s) => ({
      ...s,
      maxMark: s.maxMark.toString(),
      passMark: s.passMark.toString(),
    })),
  };
}

export class EducationBoardsService {
  static async listAll(query: ListEducationBoardsQuery) {
    const { rows, total } = await EducationBoardsRepository.listAll({
      grade: query.grade,
      isActive: query.is_active,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: rows.map(toDto),
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  static async getById(id: string) {
    const board = await EducationBoardsRepository.findById(id);
    if (!board) throw new NotFoundError("Education board not found");
    return toDto(board);
  }

  static async create(data: CreateEducationBoardInput) {
    const existing = await EducationBoardsRepository.findByNameAndGrade(
      data.name,
      data.grade,
    );
    if (existing) {
      throw new ConflictError(
        `An education board named "${data.name}" already exists for grade ${data.grade}`,
      );
    }

    const slug = await ensureUniqueSlug(toSlug(`${data.name}-${data.grade}`));

    const created = await EducationBoardsRepository.create(
      { name: data.name, grade: data.grade, slug },
      data.subjects.map((s) => ({
        name: s.name,
        maxMark: s.max_mark,
        passMark: s.pass_mark,
      })),
    );
    return toDto(created);
  }

  static async update(id: string, data: UpdateEducationBoardInput) {
    const existing = await EducationBoardsRepository.findById(id);
    if (!existing) throw new NotFoundError("Education board not found");

    const nextName = data.name ?? existing.name;
    const nextGrade = data.grade ?? existing.grade;
    const nameOrGradeChanged =
      nextName !== existing.name || nextGrade !== existing.grade;

    if (nameOrGradeChanged) {
      const conflict = await EducationBoardsRepository.findByNameAndGrade(
        nextName,
        nextGrade,
      );
      if (conflict && conflict.id !== id) {
        throw new ConflictError(
          `An education board named "${nextName}" already exists for grade ${nextGrade}`,
        );
      }
    }

    const slug = nameOrGradeChanged
      ? await ensureUniqueSlug(toSlug(`${nextName}-${nextGrade}`))
      : undefined;

    await prisma.$transaction(async (tx) => {
      await EducationBoardsRepository.updateFields(tx, id, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.grade !== undefined ? { grade: data.grade } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
      });

      if (data.subjects) {
        await EducationBoardsRepository.replaceSubjects(
          tx,
          id,
          data.subjects.map((s) => ({
            name: s.name,
            maxMark: s.max_mark,
            passMark: s.pass_mark,
          })),
        );
      }
    });

    const updated = await EducationBoardsRepository.findById(id);
    return toDto(updated!);
  }

  static async deactivate(id: string) {
    const existing = await EducationBoardsRepository.findById(id);
    if (!existing) throw new NotFoundError("Education board not found");
    if (!existing.isActive) {
      throw new ForbiddenError("Education board is already inactive");
    }
    const updated = await EducationBoardsRepository.updateFields(prisma, id, {
      isActive: false,
    });
    return toDto(updated);
  }

  static async activate(id: string) {
    const existing = await EducationBoardsRepository.findById(id);
    if (!existing) throw new NotFoundError("Education board not found");
    if (existing.isActive) {
      throw new ForbiddenError("Education board is already active");
    }
    const updated = await EducationBoardsRepository.updateFields(prisma, id, {
      isActive: true,
    });
    return toDto(updated);
  }

  /** Student-facing board picker — active boards only, name/grade/slug
   * only (no subjects, that's a separate per-board fetch). */
  static async listNamesForStudent(grade?: string, search?: string) {
    return EducationBoardsRepository.listActiveNames({ grade, search });
  }

  /** Student-facing subjects/marks read for one board — 404s (not just an
   * empty result) if the board doesn't exist OR isn't currently active, so
   * a student can never select/see a deactivated board's details. */
  static async getActiveById(id: string) {
    const board = await EducationBoardsRepository.findActiveById(id);
    if (!board) throw new NotFoundError("Education board not found");
    return toDto(board);
  }
}
