import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminAdmissionCycleController.listSeatCancellations);
router.patch(
  "/:id/review",
  CollegeAdminAdmissionCycleController.reviewSeatCancellation,
);

export default router;
