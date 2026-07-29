import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { iconSchemas } from "../validators/icons.validator";
import { IconsService } from "../services/icons.service";

export class IconsCollegeAdminController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const { search } = iconSchemas.listActiveQuery.parse(req.query);
    const icons = await IconsService.listActiveForCollegeAdmin(search);
    res.status(200).json(ApiResponse.success("Icons fetched", icons));
  }
}
