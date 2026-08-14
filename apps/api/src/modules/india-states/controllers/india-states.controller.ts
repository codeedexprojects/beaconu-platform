import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { ListIndiaStatesQueryInput } from "../validators/india-states.validator";
import allStates from "@/shared/data/india-states.json";

export class IndiaStatesController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListIndiaStatesQueryInput;

    const filtered = search
      ? allStates.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allStates;

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("States retrieved", data, meta));
  }
}
