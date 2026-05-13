import { Router } from "express";
import { CollegeOnboardingController } from "../controllers/college-onboarding.controller";

const router: Router = Router();

// Public — no auth required
router.post("/", CollegeOnboardingController.submit);

export default router;
