import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import collegeOnboardingRoutes from "@/modules/landing-page/routes/public.routes";
import publicCollegeRoutes from "@/modules/colleges/routes/public-college.routes";
const router: Router = Router();

router.use("/universities", publicUniversityRoutes);
router.use("/college-onboarding", collegeOnboardingRoutes);
router.use("/colleges", publicCollegeRoutes);

export default router;
