import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import publicBlogRoutes from "@/modules/content/routes/public.routes";
import collegeOnboardingRoutes from "@/modules/landing-page/routes/public.routes";

const router: Router = Router();

router.use("/universities", publicUniversityRoutes);
router.use("/blogs", publicBlogRoutes);
router.use("/college-onboarding", collegeOnboardingRoutes);

export default router;
