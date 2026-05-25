import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { blogSchemas } from "../validators/blogs.validator";
import { BlogService } from "../services/blogs.service";
import { BlogQuery } from "../queries/blogs.query";

export class BlogPublicController {
  static async listPublished(req: Request, res: Response): Promise<void> {
    const filters = blogSchemas.publicListQuery.parse(req.query);
    const result = await BlogQuery.listPublished(filters);
    res
      .status(200)
      .json(ApiResponse.success("Blogs fetched", result.data, result.meta));
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = blogSchemas.slugParam.parse(req.params);
    const blog = await BlogService.getPublishedBySlug(slug);
    res.status(200).json(ApiResponse.success("Blog fetched", blog));
  }
}
