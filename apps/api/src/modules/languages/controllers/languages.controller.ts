import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { ListLanguagesQueryInput } from "../validators/languages.validator";
import allLanguages from "@/shared/data/languages.json";

export class LanguagesController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListLanguagesQueryInput;

    const filtered = search
      ? allLanguages.filter((l) =>
          l.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allLanguages;

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("Languages retrieved", data, meta));
  }
}
