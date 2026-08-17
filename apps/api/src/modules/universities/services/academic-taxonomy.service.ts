import { ConflictError, NotFoundError } from "@/shared/errors";
import { AcademicTaxonomyRepository } from "../repositories/academic-taxonomy.repository";
import { AcademicTaxonomyQuery } from "../queries/academic-taxonomy.query";
import {
  AdminListQuery,
  CreateStreamInput,
  CreateDisciplineInput,
  CreateProgramTypeInput,
  CreateStudyLevelInput,
  CreateCourseMasterInput,
  ListCourseMastersQuery,
  PublicListCourseMastersQuery,
  UpdateStreamInput,
  UpdateDisciplineInput,
  UpdateProgramTypeInput,
  UpdateStudyLevelInput,
  UpdateCourseMasterInput,
} from "../validators/academic-taxonomy.validator";

export class AcademicTaxonomyService {
  static async listStreams(query: AdminListQuery) {
    return AcademicTaxonomyQuery.listStreams({
      is_active: undefined,
      ...query,
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
      logoUrl: data.logo_url,
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
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
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

  static async listDisciplines(query: AdminListQuery) {
    return AcademicTaxonomyQuery.listDisciplines({
      is_active: undefined,
      ...query,
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
      logoUrl: data.logo_url,
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
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
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

  static async listStudyLevels(query: AdminListQuery) {
    return AcademicTaxonomyQuery.listStudyLevels({
      is_active: undefined,
      ...query,
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
      logoUrl: data.logo_url,
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
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
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

  static async listProgramTypes(query: AdminListQuery) {
    return AcademicTaxonomyQuery.listProgramTypes({
      is_active: undefined,
      ...query,
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
      logoUrl: data.logo_url,
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
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
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

  static async listCourseMasters(query: ListCourseMastersQuery) {
    return AcademicTaxonomyQuery.listCourseMasters(query);
  }

  static async listCourseMastersForPublic(query: PublicListCourseMastersQuery) {
    return AcademicTaxonomyQuery.listCourseMastersForPublic(query);
  }

  static async createCourseMaster(data: CreateCourseMasterInput) {
    const discipline = await AcademicTaxonomyRepository.findDisciplineById(
      data.discipline_id,
    );
    if (!discipline) throw new NotFoundError("Discipline not found");

    if (data.study_level_id) {
      const studyLevel = await AcademicTaxonomyRepository.findStudyLevelById(
        data.study_level_id,
      );
      if (!studyLevel) throw new NotFoundError("Study level not found");
    }

    if (data.program_type_id) {
      const programType = await AcademicTaxonomyRepository.findProgramTypeById(
        data.program_type_id,
      );
      if (!programType) throw new NotFoundError("Program type not found");
    }

    const existing =
      await AcademicTaxonomyRepository.findCourseMasterByDisciplineAndSlug(
        data.discipline_id,
        data.slug,
      );
    if (existing) {
      throw new ConflictError(
        "This course already exists for the selected discipline",
      );
    }

    return AcademicTaxonomyRepository.createCourseMaster({
      name: data.name,
      slug: data.slug,
      disciplineId: data.discipline_id,
      studyLevelId: data.study_level_id,
      programTypeId: data.program_type_id,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    });
  }

  static async updateCourseMaster(id: string, data: UpdateCourseMasterInput) {
    const existing = await AcademicTaxonomyRepository.findCourseMasterById(id);
    if (!existing) throw new NotFoundError("Course not found");

    if (data.discipline_id) {
      const discipline = await AcademicTaxonomyRepository.findDisciplineById(
        data.discipline_id,
      );
      if (!discipline) throw new NotFoundError("Discipline not found");
    }
    if (data.study_level_id) {
      const studyLevel = await AcademicTaxonomyRepository.findStudyLevelById(
        data.study_level_id,
      );
      if (!studyLevel) throw new NotFoundError("Study level not found");
    }
    if (data.program_type_id) {
      const programType = await AcademicTaxonomyRepository.findProgramTypeById(
        data.program_type_id,
      );
      if (!programType) throw new NotFoundError("Program type not found");
    }

    const nextDisciplineId = data.discipline_id ?? existing.disciplineId;
    const nextSlug = data.slug ?? existing.slug;

    if (
      nextDisciplineId !== existing.disciplineId ||
      nextSlug !== existing.slug
    ) {
      const duplicate =
        await AcademicTaxonomyRepository.findCourseMasterByDisciplineAndSlug(
          nextDisciplineId,
          nextSlug,
        );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "This course already exists for the selected discipline",
        );
      }
    }

    return AcademicTaxonomyRepository.updateCourseMasterById(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.discipline_id !== undefined
        ? { disciplineId: data.discipline_id }
        : {}),
      ...(data.study_level_id !== undefined
        ? { studyLevelId: data.study_level_id }
        : {}),
      ...(data.program_type_id !== undefined
        ? { programTypeId: data.program_type_id }
        : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { isActive: data.is_active } : {}),
    });
  }

  static async disableCourseMaster(id: string) {
    const existing = await AcademicTaxonomyRepository.findCourseMasterById(id);
    if (!existing) throw new NotFoundError("Course not found");

    if (!existing.isActive) return existing;

    return AcademicTaxonomyRepository.updateCourseMasterById(id, {
      isActive: false,
    });
  }

  static async removeCourseMaster(id: string) {
    const existing = await AcademicTaxonomyRepository.findCourseMasterById(id);
    if (!existing) throw new NotFoundError("Course not found");

    return AcademicTaxonomyRepository.updateCourseMasterById(id, {
      isActive: false,
    });
  }
}
