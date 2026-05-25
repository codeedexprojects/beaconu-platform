import { ConflictError, NotFoundError } from "@/shared/errors";
import { StudentsRepository } from "../repositories/students.repository";
import { StudentsQuery } from "../queries/students.query";
import type { StudentProfile } from "@beaconu/types";
import type { Prisma } from "@beaconu/db";
import type { UpdateProfileInput } from "../validators/students.validator";

export class StudentsService {
  static async updateProfile(
    id: string,
    data: UpdateProfileInput,
  ): Promise<StudentProfile> {
    const existing = await StudentsRepository.findById(id);
    if (!existing) throw new NotFoundError("Student not found");

    if (data.email !== undefined && data.email !== null && data.email !== existing.email) {
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
}
