import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentPaymentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post(
  "/applications/:applicationId/initiate",
  StudentPaymentController.initiateApplicationPayment,
);
router.post(
  "/applications/:applicationId/confirm",
  StudentPaymentController.confirmApplicationPayment,
);

router.post(
  "/courses/:applicationCourseId/token/initiate",
  StudentPaymentController.initiateTokenPayment,
);
router.post(
  "/courses/:applicationCourseId/token/confirm",
  StudentPaymentController.confirmTokenPayment,
);

router.get("/finance/summary", StudentPaymentController.getFinanceSummary);
router.get("/finance/course-fees", StudentPaymentController.listCourseFees);
router.post(
  "/finance/fee-structures/:feeStructureId/pay/initiate",
  StudentPaymentController.initiateFullFeePayment,
);
router.post(
  "/finance/pay/confirm",
  StudentPaymentController.confirmFullFeePayment,
);
router.post(
  "/finance/fee-structures/:feeStructureId/installments/setup",
  StudentPaymentController.setupInstallmentPlan,
);
router.get(
  "/finance/fee-structures/:feeStructureId/installments",
  StudentPaymentController.listInstallments,
);
router.post(
  "/finance/installments/:ledgerEntryId/pay/initiate",
  StudentPaymentController.initiateInstallmentPayment,
);
router.post(
  "/finance/installments/pay/confirm",
  StudentPaymentController.confirmInstallmentPayment,
);

router.post(
  "/finance/semester-fees/pay/initiate",
  StudentPaymentController.initiateSemesterFeePayment,
);
router.post(
  "/finance/semester-fees/pay/confirm",
  StudentPaymentController.confirmSemesterFeePayment,
);
router.post(
  "/finance/semester-fees/installments/setup",
  StudentPaymentController.setupSemesterInstallmentPlan,
);
router.get(
  "/finance/semester-fees/installments",
  StudentPaymentController.listSemesterInstallments,
);

router.get("/receipts", StudentPaymentController.listReceipts);
router.get("/receipts/:id", StudentPaymentController.getReceipt);

export default router;
