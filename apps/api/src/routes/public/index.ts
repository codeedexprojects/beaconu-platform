import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import publicBlogRoutes from "@/modules/content/routes/public.routes";
import collegeOnboardingRoutes from "@/modules/landing-page/routes/public.routes";
import publicCollegeRoutes from "@/modules/colleges/routes/public-college.routes";
import publicNewsAlertsRoutes from "@/modules/platform-admin/routes/news-alerts-public.routes";
import publicEntranceExamsRoutes from "@/modules/platform-admin/routes/entrance-exams-public.routes";

const router: Router = Router();

router.use("/universities", publicUniversityRoutes);
router.use("/blogs", publicBlogRoutes);
router.use("/college-onboarding", collegeOnboardingRoutes);
router.use("/colleges", publicCollegeRoutes);
router.use("/news", publicNewsAlertsRoutes);
router.use("/entrance-exams", publicEntranceExamsRoutes);

export default router;
