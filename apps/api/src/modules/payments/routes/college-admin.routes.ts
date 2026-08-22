import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
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

router.get(
  "/finance/overview",
  authorize("finance.view"),
  CollegeAdminPaymentController.getFinanceOverview,
);
router.get(
  "/finance/transactions",
  authorize("finance.view"),
  CollegeAdminPaymentController.listFinanceTransactions,
);
router.get(
  "/finance/transactions/export",
  authorize("finance.view"),
  CollegeAdminPaymentController.exportFinanceTransactions,
);

export default router;
