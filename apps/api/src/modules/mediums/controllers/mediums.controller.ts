import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { ListMediumsQueryInput } from "../validators/mediums.validator";

import allMediums from "@/shared/data/languages.json";

export class MediumsController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListMediumsQueryInput;

    const filtered = search
      ? allMediums.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allMediums;

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("Mediums retrieved", data, meta));
  }
}
