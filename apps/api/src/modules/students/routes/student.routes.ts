import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get(
  "/profile",
  authenticate,
  authorizeUserType("student"),
  StudentController.getProfile,
);

router.patch(
  "/profile",
  authenticate,
  authorizeUserType("student"),
  StudentController.updateProfile,
);

export default router;
