import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get(
  "/",
  authorize("admissions.view"),
  CollegeAdminAdmissionCycleController.listCourseSwitchRequests,
);
router.patch(
  "/:id/review",
  authorize("admissions.manage"),
  CollegeAdminAdmissionCycleController.reviewCourseSwitchRequest,
);

export default router;
