import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { listMediumsQuerySchema } from "../validators/mediums.validator";
import { MediumsController } from "../controllers/mediums.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listMediumsQuerySchema, "query"),
  MediumsController.list,
);

export default router;
