import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  referralListQuerySchema,
  universityListQuerySchema,
  collegeListQuerySchema,
  streamListQuerySchema,
  createReferralCodeSchema,
  bankDetailsSchema,
  withdrawalSchema,
  walletTransactionQuerySchema,
} from "../validators/blink.validator";
import { AssociateEmployeeController } from "../controllers/associate-employee.controller";

const router: Router = Router();

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getProfile,
);

router.get(
  "/performance",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getPerformance,
);

router.get(
  "/referrals",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(referralListQuerySchema, "query"),
  AssociateEmployeeController.listReferrals,
);

router.get(
  "/referrals/:referralId",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getStudentByReferral,
);

router.get(
  "/universities",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(universityListQuerySchema, "query"),
  AssociateEmployeeController.listUniversities,
);

router.get(
  "/universities/:universityId",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(collegeListQuerySchema, "query"),
  AssociateEmployeeController.getUniversityDetail,
);

router.get(
  "/streams",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(streamListQuerySchema, "query"),
  AssociateEmployeeController.listStreams,
);

router.get(
  "/streams/:streamId",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(streamListQuerySchema, "query"),
  AssociateEmployeeController.getStreamDetail,
);

router.post(
  "/referral-codes",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(createReferralCodeSchema),
  AssociateEmployeeController.createReferralCode,
);

router.get(
  "/referral-codes",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.listReferralCodes,
);

router.patch(
  "/referral-codes/:id/deactivate",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.deactivateReferralCode,
);

router.get(
  "/wallet",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getWallet,
);

router.get(
  "/wallet/transactions",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(walletTransactionQuerySchema, "query"),
  AssociateEmployeeController.getWalletTransactions,
);

router.put(
  "/wallet/bank-details",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(bankDetailsSchema),
  AssociateEmployeeController.updateBankDetails,
);

router.post(
  "/wallet/withdraw",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(withdrawalSchema),
  AssociateEmployeeController.requestWithdrawal,
);

export default router;
