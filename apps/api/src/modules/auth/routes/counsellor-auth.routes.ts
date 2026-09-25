import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import {
  counsellorLoginSchema,
  counsellorForgotPasswordSchema,
  counsellorResetPasswordSchema,
  registerCounsellorSchema,
} from "../validators/auth.validator";
import { CounsellorAuthController } from "../controllers/counsellor-auth.controller";

const router: Router = Router();

router.post(
  "/register",
  validate(registerCounsellorSchema),
  CounsellorAuthController.register,
);
router.post(
  "/login",
  validate(counsellorLoginSchema),
  CounsellorAuthController.login,
);
router.post(
  "/forgot-password",
  validate(counsellorForgotPasswordSchema),
  CounsellorAuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(counsellorResetPasswordSchema),
  CounsellorAuthController.resetPassword,
);
router.post("/refresh-token", CounsellorAuthController.refresh);
router.post("/logout", CounsellorAuthController.logout);

export default router;
