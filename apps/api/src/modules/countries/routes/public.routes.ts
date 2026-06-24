import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import {
  listCountriesQuerySchema,
  listStatesParamsSchema,
  listDistrictsParamsSchema,
} from "../validators/countries.validator";
import { CountriesController } from "../controllers/countries.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listCountriesQuerySchema, "query"),
  CountriesController.list,
);

router.get(
  "/:countryCode/states",
  validate(listStatesParamsSchema, "params"),
  CountriesController.states,
);

router.get(
  "/:countryCode/states/:stateCode/districts",
  validate(listDistrictsParamsSchema, "params"),
  CountriesController.districts,
);

export default router;
