import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { CryptoUtils } from "@/shared/utils";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { AuthService } from "@/modules/auth/services/auth.service";
import type { UserType } from "@/modules/auth/auth.types";

export class PlatformAdminMgmtController {
  static async createAdmin(req: Request, res: Response) {
    const { fullName, email, password, platformRoleId } = req.body;

    const existing = await prisma.platformAdmin.findUnique({
      where: { email },
    });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await CryptoUtils.hash(password);

    const admin = await prisma.platformAdmin.create({
      data: {
        fullName,
        email,
        passwordHash,
        platformRoleId,
        status: "active",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json(ApiResponse.success("Admin created", admin));
  }

  static async updateAdmin(req: Request, res: Response) {
    const id = req.params.id as string;
    if (id === req.userId)
      throw new ForbiddenError("You cannot modify your own account");
    const { fullName, email, password, platformRoleId } = req.body;

    const data: any = { fullName, email, platformRoleId };
    if (password) {
      data.passwordHash = await CryptoUtils.hash(password);
    }

    const admin = await prisma.platformAdmin.update({
      where: { id },
      data,
      select: { id: true, fullName: true, email: true, status: true },
    });

    return res.status(200).json(ApiResponse.success("Admin updated", admin));
  }

  static async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    if (id === req.userId)
      throw new ForbiddenError("You cannot change your own status");
    const { status } = req.body;

    const admin = await prisma.platformAdmin.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return res.status(200).json(ApiResponse.success(`Admin ${status}`, admin));
  }

  static async deleteAdmin(req: Request, res: Response) {
    const id = req.params.id as string;
    if (id === req.userId)
      throw new ForbiddenError("You cannot delete your own account");
    await prisma.platformAdmin.update({
      where: { id },
      data: { status: "deleted" },
    });
    return res
      .status(200)
      .json(ApiResponse.success("Admin deleted successfully", null));
  }

  static async listAdmins(_req: Request, res: Response) {
    const admins = await prisma.platformAdmin.findMany({
      where: { status: { not: "deleted" } },
      include: { platformRole: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(ApiResponse.success("Admins fetched", admins));
  }

  // ── Sessions ─────────────────────────────────────────────────────────────

  /** Every active session across all platform admins, flattened and tagged
   * with the owning admin's identity — mirrors
   * CollegeRolesController.listAllStaffSessions. */
  static async listAllSessions(req: Request, res: Response) {
    const admins = await prisma.platformAdmin.findMany({
      where: { status: { not: "deleted" } },
      select: {
        id: true,
        fullName: true,
        email: true,
        platformRole: { select: { name: true } },
      },
    });

    const sessionsByUser = await AuthService.listSessionsForUsers(
      admins.map((a) => a.id),
      "platform_admin" as UserType,
    );

    const flattened = admins.flatMap((admin) => {
      const sessions = sessionsByUser.get(admin.id) ?? [];
      return sessions.map((session) => ({
        ...session,
        isCurrent: session.id === req.sessionId,
        admin: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          roleName: admin.platformRole?.name ?? "No Role",
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

  private static async loadAdmin(id?: string) {
    const admin = await prisma.platformAdmin.findFirst({
      where: { id, status: { not: "deleted" } },
    });
    if (!admin) throw new NotFoundError("Platform admin not found");
    return admin;
  }

  static async listSessions(req: Request, res: Response) {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await PlatformAdminMgmtController.loadAdmin(id);

    const sessions = await AuthService.listSessionsForUser(
      id!,
      "platform_admin" as UserType,
      req.sessionId,
    );

    return res
      .status(200)
      .json(ApiResponse.success("Active sessions listed", sessions));
  }

  static async forceLogoutSession(req: Request, res: Response) {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (id === req.userId) {
      throw new ForbiddenError("You cannot force-logout your own session");
    }
    await PlatformAdminMgmtController.loadAdmin(id);

    const revoked = await AuthService.forceLogoutSession(
      sessionId!,
      id!,
      "platform_admin" as UserType,
    );
    if (!revoked) throw new NotFoundError("Session not found");

    return res
      .status(200)
      .json(ApiResponse.success("Session signed out", null));
  }

  static async forceLogoutAllSessions(req: Request, res: Response) {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (id === req.userId) {
      throw new ForbiddenError("You cannot force-logout your own sessions");
    }
    await PlatformAdminMgmtController.loadAdmin(id);

    const count = await AuthService.forceLogoutAllSessions(
      id!,
      "platform_admin" as UserType,
    );

    return res
      .status(200)
      .json(ApiResponse.success(`Signed out ${count} active session(s)`, null));
  }
}
