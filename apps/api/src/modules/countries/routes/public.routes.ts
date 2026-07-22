import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import {
  listCountriesQuerySchema,
  listStatesParamsSchema,
  listCitiesParamsSchema,
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
  "/:countryCode/states/:stateCode/cities",
  validate(listCitiesParamsSchema, "params"),
  CountriesController.cities,
);

export default router;
