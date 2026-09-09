import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { walletTransactionQuerySchema } from "../validators/student-referral.validator";
import {
  createBankAccountSchema,
  requestRedemptionSchema,
} from "../validators/wallet.validator";
import { EngagementStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get(
  "/beaconu-card",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.getMyCard,
);

router.get(
  "/beaconu-card/transactions",
  authenticate,
  authorizeUserType("student"),
  validate(walletTransactionQuerySchema, "query"),
  EngagementStudentController.listWalletTransactions,
);

router.get(
  "/referrals/code",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.getMyReferralCode,
);

router.get(
  "/referrals/summary",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.getReferralSummary,
);

router.get(
  "/referrals",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.listMyReferrals,
);

router.get(
  "/bank-accounts",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.listBankAccounts,
);

router.post(
  "/bank-accounts",
  authenticate,
  authorizeUserType("student"),
  validate(createBankAccountSchema),
  EngagementStudentController.addBankAccount,
);

router.patch(
  "/bank-accounts/:id/primary",
  authenticate,
  authorizeUserType("student"),
  EngagementStudentController.setPrimaryBankAccount,
);

router.post(
  "/beaconu-card/redeem",
  authenticate,
  authorizeUserType("student"),
  validate(requestRedemptionSchema),
  EngagementStudentController.requestRedemption,
);

export default router;
