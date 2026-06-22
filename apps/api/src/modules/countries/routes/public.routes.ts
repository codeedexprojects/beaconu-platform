import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { listCountriesQuerySchema } from "../validators/countries.validator";
import { CountriesController } from "../controllers/countries.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listCountriesQuerySchema, "query"),
  CountriesController.list,
);

export default router;
