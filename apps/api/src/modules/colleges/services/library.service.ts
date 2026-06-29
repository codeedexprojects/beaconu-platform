import { NotFoundError, ValidationError } from "@/shared/errors";
import { LibraryRepository } from "../repositories/library.repository";
import type {
  CreateLibraryInput,
  UpdateLibraryInput,
} from "../validators/library.validator";

function assertValidTypeDepartmentPairing(
  type: string | undefined,
  departmentId: string | null | undefined,
) {
  if (type === "central" && departmentId) {
    throw new ValidationError(
      "A Central Library cannot be linked to a department",
    );
  }
  if (type === "department" && !departmentId) {
    throw new ValidationError("A Department Library must specify a department");
  }
}

export class LibraryService {
  static async listLibraries(collegeId: string) {
    return LibraryRepository.findByCollegeId(collegeId);
  }

  static async createLibrary(collegeId: string, body: CreateLibraryInput) {
    assertValidTypeDepartmentPairing(body.type, body.departmentId);

    return LibraryRepository.create({
      collegeId,
      departmentId: body.type === "department" ? body.departmentId : null,
      type: body.type,
      name: body.name,
      stats: body.stats,
      availableResources: body.availableResources,
      libraryHours: body.libraryHours,
      facilities: body.facilities,
      status: "active",
    });
  }

  static async getLibraryDetail(id: string, collegeId: string) {
    const library = await LibraryRepository.findById(id, collegeId);
    if (!library) throw new NotFoundError("Library not found");
    return library;
  }

  static async updateLibrary(
    id: string,
    collegeId: string,
    body: UpdateLibraryInput,
  ) {
    if (body.type !== undefined) {
      assertValidTypeDepartmentPairing(body.type, body.departmentId);
    }

    const library = await LibraryRepository.update(id, collegeId, {
      ...(body.type !== undefined && { type: body.type }),
      ...(body.type !== undefined && {
        departmentId: body.type === "department" ? body.departmentId : null,
      }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.stats !== undefined && { stats: body.stats }),
      ...(body.availableResources !== undefined && {
        availableResources: body.availableResources,
      }),
      ...(body.libraryHours !== undefined && {
        libraryHours: body.libraryHours,
      }),
      ...(body.facilities !== undefined && { facilities: body.facilities }),
    });
    if (!library) throw new NotFoundError("Library not found");
    return library;
  }

  static async deleteLibrary(id: string, collegeId: string) {
    const library = await LibraryRepository.softDelete(id, collegeId);
    if (!library) throw new NotFoundError("Library not found");
    return library;
  }

  static async getPublicLibrariesByIds(
    collegeId: string,
    libraryIds: string[],
  ) {
    return LibraryRepository.findPublicByCollegeAndIds(collegeId, libraryIds);
  }

  static async getPublicLibraryList(collegeSlug: string) {
    return LibraryRepository.findPublicListByCollegeSlug(collegeSlug);
  }

  static async getPublicLibraryDetail(collegeSlug: string, libraryId: string) {
    const library = await LibraryRepository.findPublicDetailById(
      collegeSlug,
      libraryId,
    );
    if (!library) throw new NotFoundError("Library not found");
    return library;
  }
}
