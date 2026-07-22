import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { LibraryService } from "../services/library.service";
import {
  publicLibraryListParamSchema,
  publicLibraryDetailParamSchema,
} from "../validators/library.validator";

export class PublicLibraryController {
  /**
   * GET /public/colleges/by-slug/:slug/libraries
   */
  static async listPublicLibraries(req: Request, res: Response) {
    const { slug } = publicLibraryListParamSchema.parse(req.params);

    const libraries = await LibraryService.getPublicLibraryList(slug);
    return res
      .status(200)
      .json(ApiResponse.success("College libraries fetched", libraries));
  }

  /**
   * GET /public/colleges/by-slug/:slug/libraries/:libraryId
   */
  static async getPublicLibraryDetail(req: Request, res: Response) {
    const { slug, libraryId } = publicLibraryDetailParamSchema.parse(
      req.params,
    );

    const library = await LibraryService.getPublicLibraryDetail(
      slug,
      libraryId,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Library detail fetched", library));
  }
}
