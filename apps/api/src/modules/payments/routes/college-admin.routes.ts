import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminPaymentController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get(
  "/offline-review-queue",
  CollegeAdminPaymentController.listOfflineReviewQueue,
);
router.patch(
  "/offline/:transactionId/review",
  CollegeAdminPaymentController.reviewOfflineTokenPayment,
);

export default router;
