import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { blogSchemas } from "../validators/blogs.validator";
import { BlogService } from "../services/blogs.service";
import { BlogQuery } from "../queries/blogs.query";

export class BlogAuthorController {
  static async submit(req: Request, res: Response): Promise<void> {
    const data = blogSchemas.submit.parse(req.body);
    const blog = await BlogService.submit(data, req.userId!, req.userType!);
    res
      .status(201)
      .json(ApiResponse.success("Blog submitted for review", blog));
  }

  static async listOwn(req: Request, res: Response): Promise<void> {
    const filters = blogSchemas.listQuery.parse(req.query);
    const result = await BlogQuery.listByAuthor(req.userId!, filters);
    res
      .status(200)
      .json(ApiResponse.success("Blogs fetched", result.data, result.meta));
  }

  static async getOwn(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const blog = await BlogService.getOwnBlog(id, req.userId!);
    res.status(200).json(ApiResponse.success("Blog fetched", blog));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = blogSchemas.idParam.parse(req.params);
    const data = blogSchemas.update.parse(req.body);
    const blog = await BlogService.update(id, req.userId!, data);
    res.status(200).json(ApiResponse.success("Blog updated", blog));
  }
}
