import { Request, Response, NextFunction } from "express";
import { prisma } from "@beaconu/db";
import { ApiResponse } from "@/shared/responses/api-response";
import { CryptoUtils } from "@/shared/utils";
import { ConflictError } from "@/shared/errors";

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
}
