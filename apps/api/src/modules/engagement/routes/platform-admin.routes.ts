import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  listRedemptionsQuerySchema,
  reviewRedemptionSchema,
} from "../validators/wallet.validator";
import { EngagementPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.view"),
  validate(listRedemptionsQuerySchema, "query"),
  EngagementPlatformAdminController.listRedemptions,
);

// Separate from the list because this is the one endpoint that decrypts a
// bank account number — keeping it per-request means the queue view can never
// bulk-leak account numbers, and this is the single place to audit.
router.get(
  "/:id/payout-details",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.manage"),
  EngagementPlatformAdminController.getPayoutDetails,
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.manage"),
  validate(reviewRedemptionSchema),
  EngagementPlatformAdminController.reviewRedemption,
);

export default router;
