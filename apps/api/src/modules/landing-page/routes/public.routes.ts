import { Router } from "express";
import { CollegeOnboardingController } from "../controllers/college-onboarding.controller";

const router: Router = Router();

router.post("/", CollegeOnboardingController.submit);

export default router;
