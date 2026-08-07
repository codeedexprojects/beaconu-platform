import { ConflictError, NotFoundError } from "@/shared/errors";
import { StudentsRepository } from "../repositories/students.repository";
import { StudentsQuery } from "../queries/students.query";
import type { ListStudentsQuery, StudentProfile } from "@beaconu/types";
import type { Prisma } from "@beaconu/db";
import type { UpdateProfileInput } from "../validators/students.validator";

export class StudentsService {
  static async getFullName(id: string): Promise<string> {
    const student = await StudentsRepository.findById(id);
    if (!student) throw new NotFoundError("Student not found");
    return student.fullName;
  }

  static async updateProfile(
    id: string,
    data: UpdateProfileInput,
  ): Promise<StudentProfile> {
    const existing = await StudentsRepository.findById(id);
    if (!existing) throw new NotFoundError("Student not found");

    if (
      data.email !== undefined &&
      data.email !== null &&
      data.email !== existing.email
    ) {
      const conflict = await StudentsRepository.findByEmail(data.email);
      if (conflict) throw new ConflictError("Email is already in use");
    }

    const existingMetadata =
      typeof existing.profileMetadata === "object" &&
      existing.profileMetadata !== null
        ? (existing.profileMetadata as Record<string, unknown>)
        : {};

    const metadataPatch: Record<string, unknown> = { ...existingMetadata };

    if (data.date_of_birth !== undefined) {
      metadataPatch.date_of_birth = data.date_of_birth;
    }
    if (data.gender !== undefined) {
      metadataPatch.gender = data.gender;
    }
    if (data.city !== undefined) {
      metadataPatch.city = data.city;
    }
    if (data.state !== undefined) {
      metadataPatch.state = data.state;
    }
    if (data.nationality !== undefined) {
      metadataPatch.nationality = data.nationality;
    }
    if (data.category !== undefined) {
      metadataPatch.category = data.category;
    }

    await StudentsRepository.updateById(id, {
      ...(data.full_name !== undefined ? { fullName: data.full_name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.avatar_url !== undefined ? { avatarUrl: data.avatar_url } : {}),
      profileMetadata: metadataPatch as Prisma.InputJsonValue,
    });

    return StudentsQuery.getProfile(id);
  }

  static async updatePersonalDetails(
    studentId: string,
    data: Prisma.InputJsonValue,
  ) {
    await StudentsRepository.updateDetailStep(
      studentId,
      "personalDetails",
      data,
    );
  }

  static async updateFamilyDetails(
    studentId: string,
    data: Prisma.InputJsonValue,
  ) {
    await StudentsRepository.updateDetailStep(studentId, "familyDetails", data);
  }

  static async updateAddressDetails(
    studentId: string,
    data: Prisma.InputJsonValue,
  ) {
    await StudentsRepository.updateDetailStep(
      studentId,
      "addressDetails",
      data,
    );
  }

  static async updateQualificationDetails(
    studentId: string,
    data: Prisma.InputJsonValue,
  ) {
    await StudentsRepository.updateDetailStep(
      studentId,
      "qualificationDetails",
      data,
    );
  }

  static async getDetailsForSnapshot(studentId: string) {
    const row = await StudentsRepository.findDetailsForSnapshot(studentId);
    if (!row) throw new NotFoundError("Student not found");
    return row;
  }

  static async listForAdmin(query: ListStudentsQuery) {
    return StudentsQuery.listForAdmin({
      search: query.search,
      status: query.status,
      source: query.source,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  static async getForAdmin(id: string): Promise<StudentProfile> {
    return StudentsQuery.getProfile(id);
  }

  static async setStatus(id: string, status: string): Promise<StudentProfile> {
    const existing = await StudentsRepository.findById(id);
    if (!existing) throw new NotFoundError("Student not found");
    if (existing.status === status) {
      throw new ConflictError(`This student's account is already ${status}`);
    }
    await StudentsRepository.setStatus(id, status);
    return StudentsQuery.getProfile(id);
  }
}
