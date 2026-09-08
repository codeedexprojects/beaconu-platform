import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  registerAssociateEmployeeSchema,
  updateEmployeeStatusSchema,
  referralListQuerySchema,
  bankDetailsSchema,
  withdrawalSchema,
  walletTransactionQuerySchema,
  serviceChargeQuerySchema,
  updateServiceChargeSchema,
  employeeRankingQuerySchema,
  employeeListQuerySchema,
  dashboardSummaryQuerySchema,
} from "../validators/blink.validator";
import { AssociateAdminController } from "../controllers/associate-admin.controller";

const router: Router = Router();

router.post(
  "/employees/register",
  validate(registerAssociateEmployeeSchema),
  AssociateAdminController.registerEmployee,
);

router.get(
  "/dashboard/summary",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(dashboardSummaryQuerySchema, "query"),
  AssociateAdminController.getDashboardSummary,
);

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.getProfile,
);
router.get(
  "/employees",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(employeeListQuerySchema, "query"),
  AssociateAdminController.listEmployees,
);
router.get(
  "/employees/leaderboard",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(employeeRankingQuerySchema, "query"),
  AssociateAdminController.listEmployeeLeaderboard,
);
router.get(
  "/employees/pending",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.listPendingEmployees,
);
router.get(
  "/employees/:employeeId/performance",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.getEmployeePerformance,
);
router.patch(
  "/employees/:employeeId/status",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(updateEmployeeStatusSchema),
  AssociateAdminController.updateEmployeeStatus,
);

router.get(
  "/referrals",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(referralListQuerySchema, "query"),
  AssociateAdminController.listReferrals,
);

router.get(
  "/referrals/:referralId/student",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.getStudentByReferral,
);

router.get(
  "/wallet",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.getWallet,
);

router.get(
  "/wallet/transactions",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(walletTransactionQuerySchema, "query"),
  AssociateAdminController.getWalletTransactions,
);

router.put(
  "/wallet/bank-details",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(bankDetailsSchema),
  AssociateAdminController.updateBankDetails,
);

router.post(
  "/wallet/withdraw",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(withdrawalSchema),
  AssociateAdminController.requestWithdrawal,
);

router.get(
  "/service-charges",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(serviceChargeQuerySchema, "query"),
  AssociateAdminController.listServiceCharges,
);

router.patch(
  "/service-charges/:id",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(updateServiceChargeSchema),
  AssociateAdminController.updateServiceCharge,
);

export default router;
