import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import collegeOnboardingRoutes from "@/modules/landing-page/routes/public.routes";
import counsellorRequestPublicRoutes from "@/modules/counselling/routes/public.routes";
import publicCollegeRoutes from "@/modules/colleges/routes/public-college.routes";
import starterGuideVideosPublicRoutes from "@/modules/platform-admin/routes/starter-guide-videos-public.routes";
import languagesPublicRoutes from "@/modules/languages/routes/public.routes";
import countriesPublicRoutes from "@/modules/countries/routes/public.routes";

const router: Router = Router();

router.use("/universities", publicUniversityRoutes);
router.use("/college-onboarding", collegeOnboardingRoutes);
router.use("/counsellor-requests", counsellorRequestPublicRoutes);
router.use("/colleges", publicCollegeRoutes);
router.use("/starter-guide/videos", starterGuideVideosPublicRoutes);
router.use("/languages", languagesPublicRoutes);
router.use("/countries", countriesPublicRoutes);

export default router;
