import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { ListCountriesQueryInput } from "../validators/countries.validator";
import allCountries from "@/shared/data/countries.json";

export class CountriesController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListCountriesQueryInput;

    const filtered = search
      ? allCountries.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allCountries;

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("Countries retrieved", data, meta));
  }
}
