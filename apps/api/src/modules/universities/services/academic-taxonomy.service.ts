import { ConflictError, NotFoundError } from "@/shared/errors";
import { AcademicTaxonomyRepository } from "../repositories/academic-taxonomy.repository";
import {
  CreateStreamInput,
  CreateDisciplineInput,
  CreateProgramTypeInput,
  CreateStudyLevelInput,
  ListDisciplinesQuery,
  ListSimpleQuery,
  UpdateStreamInput,
  UpdateDisciplineInput,
  UpdateProgramTypeInput,
  UpdateStudyLevelInput,
} from "../validators/academic-taxonomy.validator";

export class AcademicTaxonomyService {
  static async listStreams(query: ListSimpleQuery) {
    return AcademicTaxonomyRepository.listStreams({
      isActive: query.is_active,
    });
  }

  static async createStream(data: CreateStreamInput) {
    const existingByName = await AcademicTaxonomyRepository.findStreamByName(
      data.name,
    );
    if (existingByName) throw new ConflictError("Stream name already exists");

    const existingBySlug = await AcademicTaxonomyRepository.findStreamBySlug(
      data.slug,
    );
    if (existingBySlug) throw new ConflictError("Stream slug already exists");

    return AcademicTaxonomyRepository.createStream({
      name: data.name,
      slug: data.slug,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async updateStream(id: string, data: UpdateStreamInput) {
    const existing = await AcademicTaxonomyRepository.findStreamById(id);
    if (!existing) throw new NotFoundError("Stream not found");

    if (data.name && data.name !== existing.name) {
      const duplicate = await AcademicTaxonomyRepository.findStreamByName(
        data.name,
      );
      if (duplicate) throw new ConflictError("Stream name already exists");
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await AcademicTaxonomyRepository.findStreamBySlug(
        data.slug,
      );
      if (duplicate) throw new ConflictError("Stream slug already exists");
    }

    return AcademicTaxonomyRepository.updateStreamById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disableStream(id: string) {
    const existing = await AcademicTaxonomyRepository.findStreamById(id);
    if (!existing) throw new NotFoundError("Stream not found");

    if (!existing.isActive) return existing;

    return AcademicTaxonomyRepository.updateStreamById(id, {
      isActive: false,
    });
  }

  static async removeStream(id: string) {
    const existing = await AcademicTaxonomyRepository.findStreamById(id);
    if (!existing) throw new NotFoundError("Stream not found");

    return AcademicTaxonomyRepository.updateStreamById(id, {
      isActive: false,
    });
  }

  static async listDisciplines(query: ListDisciplinesQuery) {
    return AcademicTaxonomyRepository.listDisciplines({
      isActive: query.is_active,
      streamId: query.stream_id,
    });
  }

  static async createDiscipline(data: CreateDisciplineInput) {
    const stream = await AcademicTaxonomyRepository.findStreamById(
      data.stream_id,
    );
    if (!stream) throw new NotFoundError("Stream not found");

    const existing =
      await AcademicTaxonomyRepository.findDisciplineByStreamAndSlug(
        data.stream_id,
        data.slug,
      );
    if (existing) {
      throw new ConflictError("Discipline slug already exists for this stream");
    }

    return AcademicTaxonomyRepository.createDiscipline({
      streamId: data.stream_id,
      name: data.name,
      slug: data.slug,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async updateDiscipline(id: string, data: UpdateDisciplineInput) {
    const existing = await AcademicTaxonomyRepository.findDisciplineById(id);
    if (!existing) throw new NotFoundError("Discipline not found");

    const nextStreamId = data.stream_id ?? existing.streamId;
    const nextSlug = data.slug ?? existing.slug;

    if (data.stream_id) {
      const stream = await AcademicTaxonomyRepository.findStreamById(
        data.stream_id,
      );
      if (!stream) throw new NotFoundError("Stream not found");
    }

    if (nextStreamId !== existing.streamId || nextSlug !== existing.slug) {
      const duplicate =
        await AcademicTaxonomyRepository.findDisciplineByStreamAndSlug(
          nextStreamId,
          nextSlug,
        );

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "Discipline slug already exists for this stream",
        );
      }
    }

    return AcademicTaxonomyRepository.updateDisciplineById(id, {
      ...(data.stream_id !== undefined ? { streamId: data.stream_id } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disableDiscipline(id: string) {
    const existing = await AcademicTaxonomyRepository.findDisciplineById(id);
    if (!existing) throw new NotFoundError("Discipline not found");

    if (!existing.isActive) return existing;

    return AcademicTaxonomyRepository.updateDisciplineById(id, {
      isActive: false,
    });
  }

  static async removeDiscipline(id: string) {
    const existing = await AcademicTaxonomyRepository.findDisciplineById(id);
    if (!existing) throw new NotFoundError("Discipline not found");

    return AcademicTaxonomyRepository.updateDisciplineById(id, {
      isActive: false,
    });
  }

  static async listStudyLevels(query: ListSimpleQuery) {
    return AcademicTaxonomyRepository.listStudyLevels({
      isActive: query.is_active,
    });
  }

  static async createStudyLevel(data: CreateStudyLevelInput) {
    const existingByName =
      await AcademicTaxonomyRepository.findStudyLevelByName(data.name);
    if (existingByName)
      throw new ConflictError("Study level name already exists");

    const existingBySlug =
      await AcademicTaxonomyRepository.findStudyLevelBySlug(data.slug);
    if (existingBySlug)
      throw new ConflictError("Study level slug already exists");

    return AcademicTaxonomyRepository.createStudyLevel({
      name: data.name,
      slug: data.slug,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async updateStudyLevel(id: string, data: UpdateStudyLevelInput) {
    const existing = await AcademicTaxonomyRepository.findStudyLevelById(id);
    if (!existing) throw new NotFoundError("Study level not found");

    if (data.name && data.name !== existing.name) {
      const duplicate = await AcademicTaxonomyRepository.findStudyLevelByName(
        data.name,
      );
      if (duplicate) throw new ConflictError("Study level name already exists");
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await AcademicTaxonomyRepository.findStudyLevelBySlug(
        data.slug,
      );
      if (duplicate) throw new ConflictError("Study level slug already exists");
    }

    return AcademicTaxonomyRepository.updateStudyLevelById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disableStudyLevel(id: string) {
    const existing = await AcademicTaxonomyRepository.findStudyLevelById(id);
    if (!existing) throw new NotFoundError("Study level not found");

    if (!existing.isActive) return existing;

    return AcademicTaxonomyRepository.updateStudyLevelById(id, {
      isActive: false,
    });
  }

  static async removeStudyLevel(id: string) {
    const existing = await AcademicTaxonomyRepository.findStudyLevelById(id);
    if (!existing) throw new NotFoundError("Study level not found");

    return AcademicTaxonomyRepository.updateStudyLevelById(id, {
      isActive: false,
    });
  }

  static async listProgramTypes(query: ListSimpleQuery) {
    return AcademicTaxonomyRepository.listProgramTypes({
      isActive: query.is_active,
    });
  }

  static async createProgramType(data: CreateProgramTypeInput) {
    const existingByName =
      await AcademicTaxonomyRepository.findProgramTypeByName(data.name);
    if (existingByName)
      throw new ConflictError("Program type name already exists");

    const existingBySlug =
      await AcademicTaxonomyRepository.findProgramTypeBySlug(data.slug);
    if (existingBySlug)
      throw new ConflictError("Program type slug already exists");

    return AcademicTaxonomyRepository.createProgramType({
      name: data.name,
      slug: data.slug,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async updateProgramType(id: string, data: UpdateProgramTypeInput) {
    const existing = await AcademicTaxonomyRepository.findProgramTypeById(id);
    if (!existing) throw new NotFoundError("Program type not found");

    if (data.name && data.name !== existing.name) {
      const duplicate = await AcademicTaxonomyRepository.findProgramTypeByName(
        data.name,
      );
      if (duplicate)
        throw new ConflictError("Program type name already exists");
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await AcademicTaxonomyRepository.findProgramTypeBySlug(
        data.slug,
      );
      if (duplicate)
        throw new ConflictError("Program type slug already exists");
    }

    return AcademicTaxonomyRepository.updateProgramTypeById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disableProgramType(id: string) {
    const existing = await AcademicTaxonomyRepository.findProgramTypeById(id);
    if (!existing) throw new NotFoundError("Program type not found");

    if (!existing.isActive) return existing;

    return AcademicTaxonomyRepository.updateProgramTypeById(id, {
      isActive: false,
    });
  }

  static async removeProgramType(id: string) {
    const existing = await AcademicTaxonomyRepository.findProgramTypeById(id);
    if (!existing) throw new NotFoundError("Program type not found");

    return AcademicTaxonomyRepository.updateProgramTypeById(id, {
      isActive: false,
    });
  }
}
