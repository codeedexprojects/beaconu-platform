import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from "@/shared/errors";
import { generateSlug, CryptoUtils } from "@/shared/utils";

const COLLEGE_PERMISSIONS = [
  {
    code: "profile.view",
    description: "View college profile and institutional overview",
  },
  {
    code: "profile.edit",
    description: "Edit college profile and institutional overview",
  },
  { code: "campuses.view", description: "View campus facilities and details" },
  {
    code: "campuses.manage",
    description: "Create, update, and manage campus facilities",
  },
  {
    code: "academics.view",
    description: "View disciplines and course catalogs",
  },
  {
    code: "academics.manage",
    description: "Create, update, and manage disciplines and course catalogs",
  },
  {
    code: "hostel.view",
    description: "View hostel inventories, room plans, and occupancy",
  },
  {
    code: "hostel.manage",
    description:
      "Manage hostel room inventories, pricing plans, and bed allocations",
  },
  {
    code: "library.view",
    description: "View college and department libraries",
  },
  {
    code: "library.manage",
    description: "Create, update, and manage college and department libraries",
  },
  {
    code: "commute.view",
    description: "View commute routes, fleet, and transit logs",
  },
  {
    code: "commute.manage",
    description: "Configure commute routes, fleet, and driver logs",
  },
  {
    code: "staff.view",
    description: "View staff profiles and role assignments",
  },
  {
    code: "staff.manage",
    description:
      "Manage staff member profiles, custom roles, and security permissions",
  },
];

export class CollegeRolesController {
  // ── Permissions ────────────────────────────────────────────────────────────

  static async listPermissions(req: Request, res: Response) {
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Available permission codes fetched",
          COLLEGE_PERMISSIONS,
        ),
      );
  }

  // ── Roles CRUD ─────────────────────────────────────────────────────────────

  static async listRoles(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const roles = await prisma.collegeRole.findMany({
      where: {
        collegeId,
        isActive: true,
        OR: [
          { isSystemRole: false },
          { slug: { in: ["hostel_admin", "commute_admin"] } },
        ],
      },
      include: { permissions: true },
      orderBy: { createdAt: "asc" },
    });

    const formatted = roles.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      isSystemRole: r.isSystemRole,
      isActive: r.isActive,
      permissions: r.permissions.map((p) => p.permissionCode),
    }));

    return res
      .status(200)
      .json(ApiResponse.success("College roles listed", formatted));
  }

  static async createRole(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const schema = z.object({
      name: z.string().trim().min(2).max(100),
      permissionCodes: z.array(z.string()),
    });

    const body = schema.parse(req.body);
    const slug = generateSlug(body.name);

    // Check if same name/slug exists
    const existing = await prisma.collegeRole.findFirst({
      where: { collegeId, slug },
    });
    if (existing) {
      throw new ConflictError(
        `A role with name "${body.name}" already exists.`,
      );
    }

    // Check valid permission codes
    const validCodes = COLLEGE_PERMISSIONS.map((p) => p.code);
    const invalidCodes = body.permissionCodes.filter(
      (code) => !validCodes.includes(code),
    );
    if (invalidCodes.length > 0) {
      throw new BadRequestError(
        `Invalid permission codes detected: ${invalidCodes.join(", ")}`,
      );
    }

    const role = await prisma.$transaction(async (tx) => {
      const r = await tx.collegeRole.create({
        data: {
          collegeId,
          name: body.name,
          slug,
          isSystemRole: false,
          isActive: true,
        },
      });

      if (body.permissionCodes.length > 0) {
        await tx.collegeRolePermission.createMany({
          data: body.permissionCodes.map((code) => ({
            collegeRoleId: r.id,
            permissionCode: code,
          })),
        });
      }
      return r;
    });

    return res.status(201).json(
      ApiResponse.success("Custom role created", {
        id: role.id,
        name: role.name,
        slug: role.slug,
        isSystemRole: false,
        isActive: true,
        permissions: body.permissionCodes,
      }),
    );
  }

  static async updateRole(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const schema = z.object({
      name: z.string().trim().min(2).max(100).optional(),
      isActive: z.boolean().optional(),
      permissionCodes: z.array(z.string()).optional(),
    });

    const body = schema.parse(req.body);

    const role = await prisma.collegeRole.findUnique({
      where: { id },
    });

    if (!role || role.collegeId !== collegeId) {
      throw new NotFoundError("Role not found");
    }

    if (role.isSystemRole && body.name) {
      throw new ForbiddenError("Cannot rename system-defined roles");
    }

    if (body.permissionCodes) {
      const validCodes = COLLEGE_PERMISSIONS.map((p) => p.code);
      const invalid = body.permissionCodes.filter(
        (c) => !validCodes.includes(c),
      );
      if (invalid.length > 0) {
        throw new BadRequestError(
          `Invalid permission codes: ${invalid.join(", ")}`,
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.collegeRole.update({
        where: { id },
        data: {
          ...(body.name
            ? { name: body.name, slug: generateSlug(body.name) }
            : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        },
      });

      if (body.permissionCodes) {
        await tx.collegeRolePermission.deleteMany({
          where: { collegeRoleId: id },
        });
        if (body.permissionCodes.length > 0) {
          await tx.collegeRolePermission.createMany({
            data: body.permissionCodes.map((code) => ({
              collegeRoleId: id,
              permissionCode: code,
            })),
          });
        }
      }
      return r;
    });

    const finalPerms =
      body.permissionCodes ||
      (
        await prisma.collegeRolePermission.findMany({
          where: { collegeRoleId: id },
        })
      ).map((p) => p.permissionCode);

    return res.status(200).json(
      ApiResponse.success("Role updated successfully", {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        isSystemRole: updated.isSystemRole,
        isActive: updated.isActive,
        permissions: finalPerms,
      }),
    );
  }

  static async deleteRole(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const role = await prisma.collegeRole.findUnique({
      where: { id },
    });

    if (!role || role.collegeId !== collegeId) {
      throw new NotFoundError("Role not found");
    }

    if (role.isSystemRole) {
      throw new ForbiddenError("System roles cannot be deleted.");
    }

    // Check if there are active staff members using this role
    const inUse = await prisma.staffMember.findFirst({
      where: { collegeRoleId: id, status: "active" },
    });
    if (inUse) {
      throw new ConflictError(
        "Cannot delete role: active staff members are currently assigned to it.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.collegeRolePermission.deleteMany({
        where: { collegeRoleId: id },
      });
      await tx.collegeRole.delete({
        where: { id },
      });
    });

    return res
      .status(200)
      .json(ApiResponse.success("Role deleted successfully", null));
  }

  // ── Staff Directory ─────────────────────────────────────────────────────────

  static async listStaff(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const staff = await prisma.staffMember.findMany({
      where: { collegeId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        status: true,
        collegeRoleId: true,
        collegeRole: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Staff directory listed", staff));
  }

  static async inviteStaff(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const schema = z.object({
      fullName: z.string().trim().min(2).max(255),
      email: z.string().trim().email(),
      phoneNumber: z.string().trim().optional().nullable(),
      password: z.string().min(6),
      collegeRoleId: z.string(),
    });

    const body = schema.parse(req.body);
    const normalizedEmail = body.email.trim().toLowerCase();

    // Verify email not taken under this college
    const existing = await prisma.staffMember.findFirst({
      where: {
        collegeId,
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });
    if (existing) {
      throw new ConflictError(
        `Email "${normalizedEmail}" is already registered for this college.`,
      );
    }

    // Verify role exists
    const role = await prisma.collegeRole.findUnique({
      where: { id: body.collegeRoleId },
    });
    if (!role || role.collegeId !== collegeId) {
      throw new NotFoundError("Assigned role not found");
    }

    const passwordHash = await CryptoUtils.hash(body.password);

    const staff = await prisma.staffMember.create({
      data: {
        collegeId,
        collegeRoleId: body.collegeRoleId,
        fullName: body.fullName,
        email: normalizedEmail,
        phoneNumber: body.phoneNumber || null,
        passwordHash,
        status: "active",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        status: true,
        collegeRoleId: true,
        collegeRole: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
    });

    return res
      .status(201)
      .json(ApiResponse.success("Staff member created successfully", staff));
  }

  static async updateStaff(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const schema = z.object({
      collegeRoleId: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    });

    const body = schema.parse(req.body);

    const staff = await prisma.staffMember.findUnique({
      where: { id },
    });
    if (!staff || staff.collegeId !== collegeId) {
      throw new NotFoundError("Staff member not found");
    }

    if (id === req.userId) {
      throw new ForbiddenError("You cannot modify your own staff record");
    }

    if (body.collegeRoleId) {
      const role = await prisma.collegeRole.findUnique({
        where: { id: body.collegeRoleId },
      });
      if (!role || role.collegeId !== collegeId) {
        throw new NotFoundError("Role not found");
      }
    }

    const updated = await prisma.staffMember.update({
      where: { id },
      data: {
        ...(body.collegeRoleId ? { collegeRoleId: body.collegeRoleId } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        status: true,
        collegeRoleId: true,
        collegeRole: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(ApiResponse.success("Staff member updated", updated));
  }
}
