import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { loginSchema } from "../validators/auth.validator";
import { BlinkAuthController } from "../controllers/blink-auth.controller";

const router: Router = Router();

router.post("/login", validate(loginSchema), BlinkAuthController.login);
router.post("/refresh-token", BlinkAuthController.refresh);
router.post("/logout", BlinkAuthController.logout);

export default router;
