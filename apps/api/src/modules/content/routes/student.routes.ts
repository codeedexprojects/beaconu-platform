import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("student"),
  BlogStudentController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("student"),
  BlogStudentController.listOwn,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("student"),
  BlogStudentController.getOwn,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("student"),
  BlogStudentController.update,
);

export default router;
