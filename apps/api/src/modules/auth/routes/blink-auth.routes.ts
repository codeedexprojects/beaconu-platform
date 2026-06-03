import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import {
  loginSchema,
  registerAssociateAdminSchema,
  registerEmployeeSchema,
  blinkForgotPasswordSchema,
  blinkVerifyResetOtpSchema,
  blinkResetPasswordSchema,
} from "../validators/auth.validator";
import { BlinkAuthController } from "../controllers/blink-auth.controller";

const router: Router = Router();

router.post(
  "/register",
  validate(registerAssociateAdminSchema),
  BlinkAuthController.register,
);
router.post(
  "/register-employee",
  validate(registerEmployeeSchema),
  BlinkAuthController.registerEmployee,
);
router.post("/login", validate(loginSchema), BlinkAuthController.login);
router.post("/refresh-token", BlinkAuthController.refresh);
router.post("/logout", BlinkAuthController.logout);

router.post(
  "/forgot-password",
  validate(blinkForgotPasswordSchema),
  BlinkAuthController.forgotPassword,
);
router.post(
  "/verify-reset-otp",
  validate(blinkVerifyResetOtpSchema),
  BlinkAuthController.verifyResetOtp,
);
router.post(
  "/reset-password",
  validate(blinkResetPasswordSchema),
  BlinkAuthController.resetPassword,
);

export default router;
