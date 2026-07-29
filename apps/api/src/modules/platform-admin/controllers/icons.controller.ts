import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { iconSchemas } from "../validators/icons.validator";
import { IconsService } from "../services/icons.service";

export class IconsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = iconSchemas.listQuery.parse(req.query);
    const result = await IconsService.listAll(filters);
    res
      .status(200)
      .json(ApiResponse.success("Icons fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = iconSchemas.idParam.parse(req.params);
    const icon = await IconsService.getById(id);
    res.status(200).json(ApiResponse.success("Icon fetched", icon));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = iconSchemas.create.parse(req.body);
    const icon = await IconsService.create(data);
    res.status(201).json(ApiResponse.success("Icon created", icon));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = iconSchemas.idParam.parse(req.params);
    const data = iconSchemas.update.parse(req.body);
    const icon = await IconsService.update(id, data);
    res.status(200).json(ApiResponse.success("Icon updated", icon));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = iconSchemas.idParam.parse(req.params);
    const icon = await IconsService.deactivate(id);
    res.status(200).json(ApiResponse.success("Icon deactivated", icon));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = iconSchemas.idParam.parse(req.params);
    const icon = await IconsService.activate(id);
    res.status(200).json(ApiResponse.success("Icon activated", icon));
  }
}
