import { Router } from "express";
import { StudentAuthController } from "../controllers/student-auth.controller";

const router: Router = Router();

router.post("/send-otp", StudentAuthController.sendOtp);
router.post("/resend-otp", StudentAuthController.resendOtp);
router.post("/verify-otp", StudentAuthController.verifyOtp);
router.post("/register", StudentAuthController.register);
router.post("/refresh-token", StudentAuthController.refresh);
router.post("/logout", StudentAuthController.logout);

export default router;
