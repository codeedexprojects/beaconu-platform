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
import { AuthService } from "@/modules/auth/services/auth.service";
import type { UserType } from "@/modules/auth/auth.types";

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
  {
    code: "staff.sessions.manage",
    description:
      "View staff active login sessions and force sign-out on specific devices",
  },
  {
    code: "finance.view",
    description: "View revenue, collections, and transaction history",
  },
  {
    code: "payments.manage",
    description:
      "Review offline payment submissions and process finance actions",
  },
  {
    code: "admissions.view",
    description:
      "View application forms, applications, quotas, course-switch and seat-cancellation requests",
  },
  {
    code: "admissions.manage",
    description:
      "Manage application forms, review applications, quotas, course-switch and seat-cancellation requests",
  },
  {
    code: "assessments.view",
    description: "View the question bank, templates, papers, and slots",
  },
  {
    code: "assessments.manage",
    description: "Manage the question bank, templates, papers, and slots",
  },
  {
    code: "evaluation.manage",
    description: "Score answers and publish assessment results",
  },
  {
    code: "interviews.view",
    description: "View interview slots, bookings, and reschedule requests",
  },
  {
    code: "interviews.manage",
    description:
      "Manage interview slots, review bookings/reschedules, and shortlist candidates",
  },
  {
    code: "documents.view",
    description: "View document requirements, submissions, and complaints",
  },
  {
    code: "documents.manage",
    description:
      "Manage document requirements, review submissions, and anti-ragging complaints",
  },
  {
    code: "scholarships.view",
    description: "View scholarship applications",
  },
  {
    code: "scholarships.manage",
    description: "Review and manage scholarship applications",
  },
  {
    code: "students.view",
    description: "View the enrolled students directory",
  },
  {
    code: "students.manage",
    description: "Manage enrolled student records",
  },
  {
    code: "support.manage",
    description: "Respond to student queries and call-back requests",
  },
  {
    code: "notices.manage",
    description: "Create and manage the notice board",
  },
  {
    code: "campus-visits.manage",
    description: "Manage campus visit scheduling and availability",
  },
  {
    code: "media-kit.manage",
    description: "Manage media kit content",
  },
  {
    code: "community.manage",
    description: "Moderate community posts and comments",
  },
  {
    code: "ambassadors.manage",
    description: "Manage campus ambassador registrations",
  },
];

export class CollegeRolesController {
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

    const existing = await prisma.collegeRole.findFirst({
      where: { collegeId, slug },
    });
    if (existing) {
      throw new ConflictError(
        `A role with name "${body.name}" already exists.`,
      );
    }

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
      fullName: z.string().trim().min(2).max(255).optional(),
      email: z.string().trim().email().optional(),
      phoneNumber: z.string().trim().optional().nullable(),
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

    if (body.email && body.email !== staff.email) {
      const existing = await prisma.staffMember.findUnique({
        where: { uq_staff_email_college: { email: body.email, collegeId } },
      });
      if (existing && existing.id !== id) {
        throw new ConflictError(
          "Another staff member with this email already exists",
        );
      }
    }

    const updated = await prisma.staffMember.update({
      where: { id },
      data: {
        ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.phoneNumber !== undefined
          ? { phoneNumber: body.phoneNumber }
          : {}),
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

  // ── Staff Sessions ───────────────────────────────────────────────────────

  /** Every active session across the whole college's staff, flattened and
   * tagged with the owning staff member's identity — the "Active Sessions"
   * sidebar page, as opposed to listStaffSessions (one staff member's own
   * session list, opened from their row in the directory). */
  static async listAllStaffSessions(req: Request, res: Response) {
    const collegeId = req.collegeId!;

    const staffList = await prisma.staffMember.findMany({
      where: { collegeId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        collegeRole: { select: { name: true } },
      },
    });

    const sessionsByUser = await AuthService.listSessionsForUsers(
      staffList.map((s) => s.id),
      "staff_member" as UserType,
    );

    const flattened = staffList.flatMap((staff) => {
      const sessions = sessionsByUser.get(staff.id) ?? [];
      return sessions.map((session) => ({
        ...session,
        isCurrent: session.id === req.sessionId,
        staff: {
          id: staff.id,
          fullName: staff.fullName,
          email: staff.email,
          avatarUrl: staff.avatarUrl,
          roleName: staff.collegeRole.name,
        },
      }));
    });

    flattened.sort(
      (a, b) =>
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    );

    return res
      .status(200)
      .json(ApiResponse.success("Active sessions listed", flattened));
  }

  private static async loadStaffForCollege(collegeId: string, id?: string) {
    const staff = await prisma.staffMember.findUnique({ where: { id } });
    if (!staff || staff.collegeId !== collegeId) {
      throw new NotFoundError("Staff member not found");
    }
    return staff;
  }

  static async listStaffSessions(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await CollegeRolesController.loadStaffForCollege(collegeId, id);

    const sessions = await AuthService.listSessionsForUser(
      id!,
      "staff_member" as UserType,
      req.sessionId,
    );

    return res
      .status(200)
      .json(ApiResponse.success("Active sessions listed", sessions));
  }

  static async forceLogoutStaffSession(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    await CollegeRolesController.loadStaffForCollege(collegeId, id);

    const revoked = await AuthService.forceLogoutSession(
      sessionId!,
      id!,
      "staff_member" as UserType,
    );
    if (!revoked) throw new NotFoundError("Session not found");

    return res
      .status(200)
      .json(ApiResponse.success("Session signed out", null));
  }

  static async forceLogoutAllStaffSessions(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await CollegeRolesController.loadStaffForCollege(collegeId, id);

    const count = await AuthService.forceLogoutAllSessions(
      id!,
      "staff_member" as UserType,
    );

    return res
      .status(200)
      .json(ApiResponse.success(`Signed out ${count} active session(s)`, null));
  }
}
