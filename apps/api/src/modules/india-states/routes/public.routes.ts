import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { listIndiaStatesQuerySchema } from "../validators/india-states.validator";
import { IndiaStatesController } from "../controllers/india-states.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listIndiaStatesQuerySchema, "query"),
  IndiaStatesController.list,
);

export default router;
