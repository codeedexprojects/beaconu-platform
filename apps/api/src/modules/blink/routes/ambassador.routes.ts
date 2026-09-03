import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  registerAmbassadorSchema,
  collegeListQuerySchema,
  createReferralCodeSchema,
  bankDetailsSchema,
  withdrawalSchema,
  walletTransactionQuerySchema,
} from "../validators/blink.validator";
import { AmbassadorController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.post(
  "/register",
  authenticate,
  authorizeUserType("staff_member"),
  authorize("staff.manage"),
  validate(registerAmbassadorSchema),
  AmbassadorController.register,
);

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.getProfile,
);

router.patch(
  "/profile",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.updateProfile,
);

router.get(
  "/colleges",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(collegeListQuerySchema, "query"),
  AmbassadorController.listColleges,
);

router.get(
  "/colleges/:collegeId/courses",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.listCoursesByCollege,
);

router.get(
  "/colleges/:collegeId/courses/:courseId",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.getCourseDetail,
);

router.post(
  "/referral-codes",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(createReferralCodeSchema),
  AmbassadorController.createReferralCode,
);

router.get(
  "/referral-codes",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.listReferralCodes,
);

router.patch(
  "/referral-codes/:id/deactivate",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.deactivateReferralCode,
);

router.get(
  "/wallet",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.getWallet,
);

router.get(
  "/wallet/transactions",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(walletTransactionQuerySchema, "query"),
  AmbassadorController.getWalletTransactions,
);

router.put(
  "/wallet/bank-details",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(bankDetailsSchema),
  AmbassadorController.updateBankDetails,
);

router.post(
  "/wallet/withdraw",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(withdrawalSchema),
  AmbassadorController.requestWithdrawal,
);

export default router;
