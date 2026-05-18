import { Router } from "express";
import { StaffAuthController } from "../controllers/staff-auth.controller";
import { loginSchema } from "../validators/auth.validator";
import { validate } from "@/shared/middleware/validate";

const router: Router = Router();

// Public — no auth required
router.post("/login", validate(loginSchema), StaffAuthController.login);
router.get("/verify-setup-token/:token", StaffAuthController.verifySetupToken);
router.post("/setup-account", StaffAuthController.setupAccount);

// Authenticated
router.post("/refresh-token", StaffAuthController.refresh);
router.post("/logout", StaffAuthController.logout);

export default router;
