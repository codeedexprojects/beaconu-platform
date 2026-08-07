import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { EngagementStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get(
  "/beaconu-card",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.getMyCard,
);

export default router;
