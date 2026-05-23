import { randomBytes } from "crypto";
import { ConflictError, NotFoundError, BadRequestError } from "@/shared/errors";
import { InstitutionGroupRepository } from "../repositories/institution-group.repository";

function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from(randomBytes(n))
      .map((b) => chars[b % chars.length])
      .join("");
  return `IGC-${pick(4)}-${pick(4)}`;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export class InstitutionGroupService {
  static async enableForCollege(
    collegeId: string,
    data: { name: string; description?: string },
  ) {
    const existing =
      await InstitutionGroupRepository.findByOwnerCollegeId(collegeId);
    if (existing && existing.status === "active") {
      throw new ConflictError(
        "This college already has an active institution group",
      );
    }

    if (existing && existing.status !== "active") {
      return InstitutionGroupRepository.updateStatus(existing.id, "active");
    }

    let groupCode: string;
    let attempts = 0;
    do {
      groupCode = generateGroupCode();
      const clash = await InstitutionGroupRepository.findByGroupCode(groupCode);
      if (!clash) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new ConflictError(
        "Failed to generate unique group code. Please try again.",
      );
    }

    const group = await InstitutionGroupRepository.create({
      name: data.name,
      slug: toSlug(data.name),
      groupCode,
      createdByCollegeId: collegeId,
      description: data.description,
    });

    await InstitutionGroupRepository.createMember({
      groupId: group.id,
      collegeId,
      role: "admin",
      joinedVia: "owner",
    });

    return InstitutionGroupRepository.findById(group.id);
  }

  static async disableForCollege(collegeId: string) {
    const existing =
      await InstitutionGroupRepository.findByOwnerCollegeId(collegeId);
    if (!existing) {
      throw new NotFoundError("No institution group found for this college");
    }
    if (existing.status === "inactive") {
      return existing; // already inactive
    }
    return InstitutionGroupRepository.updateStatus(existing.id, "inactive");
  }

  static async getGroupForCollege(collegeId: string) {
    return InstitutionGroupRepository.findByOwnerCollegeId(collegeId);
  }

  static async joinGroupByCode(collegeId: string, groupCode: string) {
    const group = await InstitutionGroupRepository.findByGroupCode(groupCode);
    if (!group) {
      throw new NotFoundError(
        "Invalid group code. No institution group found.",
      );
    }
    if (group.status !== "active") {
      throw new BadRequestError(
        "This institution group is currently inactive.",
      );
    }

    const existingMember =
      await InstitutionGroupRepository.findMemberByCollegeId(collegeId);
    if (existingMember) {
      throw new ConflictError(
        "This college is already a member of an institution group.",
      );
    }

    return InstitutionGroupRepository.createMember({
      groupId: group.id,
      collegeId,
      role: "member",
      joinedVia: "code",
    });
  }

  static async getMyGroupMembership(collegeId: string) {
    const ownedGroup =
      await InstitutionGroupRepository.findByOwnerCollegeId(collegeId);
    if (ownedGroup) {
      return { type: "owner" as const, group: ownedGroup };
    }

    const membership =
      await InstitutionGroupRepository.findMemberByCollegeId(collegeId);
    if (membership) {
      return { type: "member" as const, membership };
    }

    return null;
  }
}
