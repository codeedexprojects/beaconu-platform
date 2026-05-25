import { prisma } from "@beaconu/db";

const GROUP_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  groupCode: true,
  createdByCollegeId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const GROUP_WITH_MEMBERS_SELECT = {
  ...GROUP_SELECT,
  createdByCollege: {
    select: { id: true, name: true, slug: true, code: true },
  },
  members: {
    select: {
      id: true,
      role: true,
      joinedVia: true,
      joinedAt: true,
      college: {
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          city: true,
          state: true,
          status: true,
          logoUrl: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" as const },
  },
} as const;

const MEMBER_SELECT = {
  id: true,
  groupId: true,
  collegeId: true,
  role: true,
  joinedVia: true,
  joinedAt: true,
} as const;

export class InstitutionGroupRepository {
  static async findByOwnerCollegeId(collegeId: string) {
    return prisma.institutionGroup.findFirst({
      where: { createdByCollegeId: collegeId },
      select: GROUP_WITH_MEMBERS_SELECT,
    });
  }

  static async findByGroupCode(code: string) {
    return prisma.institutionGroup.findUnique({
      where: { groupCode: code },
      select: GROUP_WITH_MEMBERS_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.institutionGroup.findUnique({
      where: { id },
      select: GROUP_WITH_MEMBERS_SELECT,
    });
  }

  static async create(data: {
    name: string;
    slug: string;
    groupCode: string;
    createdByCollegeId: string;
    description?: string;
    createdByStaffId?: string;
  }) {
    return prisma.institutionGroup.create({
      data,
      select: GROUP_WITH_MEMBERS_SELECT,
    });
  }

  static async updateStatus(groupId: string, status: string) {
    return prisma.institutionGroup.update({
      where: { id: groupId },
      data: { status },
      select: GROUP_WITH_MEMBERS_SELECT,
    });
  }

  static async findMemberByCollegeId(collegeId: string) {
    return prisma.institutionGroupMember.findUnique({
      where: { collegeId },
      select: {
        ...MEMBER_SELECT,
        group: { select: GROUP_SELECT },
      },
    });
  }

  static async createMember(data: {
    groupId: string;
    collegeId: string;
    role?: string;
    joinedVia?: string;
  }) {
    return prisma.institutionGroupMember.create({
      data: {
        groupId: data.groupId,
        collegeId: data.collegeId,
        role: data.role ?? "member",
        joinedVia: data.joinedVia ?? "code",
      },
      select: {
        ...MEMBER_SELECT,
        group: { select: GROUP_SELECT },
      },
    });
  }
}
