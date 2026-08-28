import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminAdmissionCycleController.listSeatCancellations);
router.get("/:id", CollegeAdminAdmissionCycleController.getSeatCancellation);
router.patch(
  "/:id/review",
  CollegeAdminAdmissionCycleController.reviewSeatCancellation,
);
router.patch(
  "/:id/initiation",
  CollegeAdminAdmissionCycleController.submitSeatCancellationInitiation,
);
router.post(
  "/:id/schedule-counseling",
  CollegeAdminAdmissionCycleController.scheduleSeatCancellationCounseling,
);
router.patch(
  "/:id/counseling-outcome",
  CollegeAdminAdmissionCycleController.submitSeatCancellationCounselingOutcome,
);
router.patch(
  "/:id/settlement",
  CollegeAdminAdmissionCycleController.submitSeatCancellationSettlement,
);
router.patch(
  "/:id/final-clearance",
  CollegeAdminAdmissionCycleController.finalizeSeatCancellationClearance,
);

export default router;
