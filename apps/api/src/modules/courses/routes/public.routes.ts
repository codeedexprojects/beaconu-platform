import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { listCoursesQuerySchema } from "../validators/courses.validator";
import { CoursesController } from "../controllers/courses.controller";

const router: Router = Router();

router.get(
  "/",
  validate(listCoursesQuerySchema, "query"),
  CoursesController.list,
);

export default router;
