import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import collegeOnboardingRoutes from "@/modules/landing-page/routes/public.routes";
import counsellorRequestPublicRoutes from "@/modules/counselling/routes/public.routes";
import publicCollegeRoutes from "@/modules/colleges/routes/public-college.routes";
import starterGuidePublicRoutes from "@/modules/platform-admin/routes/starter-guide-public.routes";
import feedPublicRoutes from "@/modules/platform-admin/routes/feed-public.routes";
import languagesPublicRoutes from "@/modules/languages/routes/public.routes";
import countriesPublicRoutes from "@/modules/countries/routes/public.routes";
import indiaStatesPublicRoutes from "@/modules/india-states/routes/public.routes";
import mediumsPublicRoutes from "@/modules/mediums/routes/public.routes";
import coursesPublicRoutes from "@/modules/courses/routes/public.routes";
import blinkReferralPublicRoutes from "@/modules/blink/routes/public.routes";
import blogsPublicRoutes from "@/modules/content/routes/public.routes";

const router: Router = Router();

router.use("/referrals", blinkReferralPublicRoutes);
router.use("/universities", publicUniversityRoutes);
router.use("/college-onboarding", collegeOnboardingRoutes);
router.use("/counsellor-requests", counsellorRequestPublicRoutes);
router.use("/colleges", publicCollegeRoutes);
router.use("/starter-guide", starterGuidePublicRoutes);
router.use("/feed", feedPublicRoutes);
router.use("/languages", languagesPublicRoutes);
router.use("/countries", countriesPublicRoutes);
router.use("/india-states", indiaStatesPublicRoutes);
router.use("/mediums", mediumsPublicRoutes);
router.use("/courses", coursesPublicRoutes);
router.use("/blogs", blogsPublicRoutes);

export default router;
