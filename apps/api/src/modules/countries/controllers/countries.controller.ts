import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import {
  getCountries,
  getStatesOfCountry,
  getDistrictsOfState,
} from "@beaconu/utils";
import type {
  ListCountriesQueryInput,
  ListStatesParamsInput,
  ListDistrictsParamsInput,
} from "../validators/countries.validator";

export class CountriesController {
  static list(req: Request, res: Response) {
    const { search, page, limit } =
      req.query as unknown as ListCountriesQueryInput;

    const filtered = getCountries(search);

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const meta = PaginationHelper.createMeta(total, page, limit);

    return res
      .status(200)
      .json(ApiResponse.success("Countries retrieved", data, meta));
  }

  static states(req: Request, res: Response) {
    const { countryCode } = req.params as unknown as ListStatesParamsInput;

    const data = getStatesOfCountry(countryCode.toUpperCase());

    return res.status(200).json(ApiResponse.success("States retrieved", data));
  }

  static districts(req: Request, res: Response) {
    const { countryCode, stateCode } =
      req.params as unknown as ListDistrictsParamsInput;

    const data = getDistrictsOfState(
      countryCode.toUpperCase(),
      stateCode.toUpperCase(),
    );

    return res
      .status(200)
      .json(ApiResponse.success("Districts retrieved", data));
  }
}
