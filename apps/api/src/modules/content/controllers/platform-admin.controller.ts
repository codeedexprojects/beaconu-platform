import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { blogSchemas } from "../validators/blogs.validator";
import { BlogService } from "../services/blogs.service";
import { BlogQuery } from "../queries/blogs.query";

export class BlogPlatformAdminController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = blogSchemas.listQuery.parse(req.query);
    const result = await BlogQuery.listAll(filters);
    res
      .status(200)
      .json(ApiResponse.success("Blogs fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const blog = await BlogQuery.getById(id);
    res.status(200).json(ApiResponse.success("Blog fetched", blog));
  }

  static async approve(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const blog = await BlogService.approve(id, req.userId!);
    res
      .status(200)
      .json(ApiResponse.success("Blog approved and published", blog));
  }

  static async reject(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const { rejection_reason } = blogSchemas.reject.parse(req.body);
    const blog = await BlogService.reject(id, req.userId!, rejection_reason);
    res.status(200).json(ApiResponse.success("Blog rejected", blog));
  }

  static async unpublish(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const blog = await BlogService.unpublish(id);
    res.status(200).json(ApiResponse.success("Blog unpublished", blog));
  }
}
