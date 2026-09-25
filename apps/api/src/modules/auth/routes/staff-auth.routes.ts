import { Router } from "express";
import { StaffAuthController } from "../controllers/staff-auth.controller";
import {
  staffForgotPasswordSchema,
  staffLoginSchema,
  staffResetPasswordSchema,
} from "../validators/auth.validator";
import { validate } from "@/shared/middleware/validate";

const router: Router = Router();

router.post("/login", validate(staffLoginSchema), StaffAuthController.login);
router.post(
  "/forgot-password",
  validate(staffForgotPasswordSchema),
  StaffAuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(staffResetPasswordSchema),
  StaffAuthController.resetPassword,
);
router.get("/verify-setup-token/:token", StaffAuthController.verifySetupToken);
router.post("/setup-account", StaffAuthController.setupAccount);

router.post("/refresh-token", StaffAuthController.refresh);
router.post("/logout", StaffAuthController.logout);

export default router;
