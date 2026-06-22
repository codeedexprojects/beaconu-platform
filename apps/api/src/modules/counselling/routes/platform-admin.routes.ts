import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { updateCounsellorStatusSchema } from "../validators/counselling.validator";
import {
  listCounsellorSlotsQuerySchema,
  listSessionsQuerySchema,
  listWalletTransactionsQuerySchema,
  listWithdrawalRequestsQuerySchema,
  updateWithdrawalStatusSchema,
} from "../validators/sessions.validator";
import {
  listRefundRequestsQuerySchema,
  updateRefundStatusSchema,
} from "../validators/refund.validator";
import { CounsellingPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.listAll,
);

router.get(
  "/withdrawals",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listWithdrawalRequestsQuerySchema, "query"),
  CounsellingPlatformAdminController.listWithdrawalRequests,
);
router.patch(
  "/withdrawals/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  validate(updateWithdrawalStatusSchema),
  CounsellingPlatformAdminController.updateWithdrawalStatus,
);

router.get(
  "/refund-requests",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listRefundRequestsQuerySchema, "query"),
  CounsellingPlatformAdminController.listRefundRequests,
);
router.patch(
  "/refund-requests/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  validate(updateRefundStatusSchema),
  CounsellingPlatformAdminController.updateRefundStatus,
);

router.get(
  "/:id/detail",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.getDetail,
);
router.get(
  "/:id/wallet-transactions",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listWalletTransactionsQuerySchema, "query"),
  CounsellingPlatformAdminController.getWalletTransactions,
);
router.get(
  "/:id/slots",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listCounsellorSlotsQuerySchema, "query"),
  CounsellingPlatformAdminController.getSlots,
);
router.get(
  "/:id/sessions",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listSessionsQuerySchema, "query"),
  CounsellingPlatformAdminController.getSessions,
);
router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.getById,
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  validate(updateCounsellorStatusSchema),
  CounsellingPlatformAdminController.updateStatus,
);

export default router;
