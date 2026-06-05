import { Request, Response } from "express";
import { ForbiddenError } from "@/shared/errors";
import { ApiResponse } from "@/shared/responses/api-response";
import { CommunityService } from "../services/community.service";
import { CommunitySchema } from "../validators/community.validator";

export class CommunityPlatformAdminController {
  static async list(req: Request, res: Response): Promise<void> {
    const isSuperAdmin = req.permissions?.includes("*");
    if (!isSuperAdmin) {
      throw new ForbiddenError("Only super admin can view all communities");
    }

    const filters = CommunitySchema.adminListQuery.parse(req.query);
    const result = await CommunityService.listForAdmin(filters);

    res
      .status(200)
      .json(
        ApiResponse.success(
          "All communities fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async disable(req: Request, res: Response): Promise<void> {
    const params = CommunitySchema.idParam.parse(req.params);

    const isSuperAdmin = req.permissions?.includes("*");
    if (!isSuperAdmin) {
      throw new ForbiddenError("Only super admin can disable communities");
    }

    const result = await CommunityService.disableCommunity(params.id);

    res.status(200).json(ApiResponse.success("Community disabled", result));
  }
}
