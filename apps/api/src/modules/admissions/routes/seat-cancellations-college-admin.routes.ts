import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("admissions.view");
const manage = authorize("admissions.manage");

router.get(
  "/",
  view,
  CollegeAdminAdmissionCycleController.listSeatCancellations,
);
router.get(
  "/:id",
  view,
  CollegeAdminAdmissionCycleController.getSeatCancellation,
);
router.patch(
  "/:id/review",
  manage,
  CollegeAdminAdmissionCycleController.reviewSeatCancellation,
);
router.patch(
  "/:id/initiation",
  manage,
  CollegeAdminAdmissionCycleController.submitSeatCancellationInitiation,
);
router.post(
  "/:id/schedule-counseling",
  manage,
  CollegeAdminAdmissionCycleController.scheduleSeatCancellationCounseling,
);
router.patch(
  "/:id/counseling-outcome",
  manage,
  CollegeAdminAdmissionCycleController.submitSeatCancellationCounselingOutcome,
);
router.patch(
  "/:id/settlement",
  manage,
  CollegeAdminAdmissionCycleController.submitSeatCancellationSettlement,
);
router.patch(
  "/:id/final-clearance",
  manage,
  CollegeAdminAdmissionCycleController.finalizeSeatCancellationClearance,
);

export default router;
