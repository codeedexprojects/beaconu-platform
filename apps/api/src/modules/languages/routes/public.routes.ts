import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { listLanguagesQuerySchema } from "../validators/languages.validator";
import { LanguagesController } from "../controllers/languages.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listLanguagesQuerySchema, "query"),
  LanguagesController.list,
);

export default router;
