import { Router } from "express";
import { PublicCollegeController } from "../controllers/public-college.controller";
import { CourseTabsController } from "../controllers/course-tabs.controller";
import { PublicHostelController } from "../controllers/public-hostel.controller";

const router: Router = Router();

router.get("/", PublicCollegeController.getColleges);
router.get(
  "/:collegeId/section/:sectionName",
  PublicCollegeController.getCollegeSection,
);

// ── Course Detail + Tabs (public) ─────────────────────────────────────────────
router.get(
  "/by-slug/:slug/courses/:courseId/tabs/:tabName",
  CourseTabsController.getPublicCourseTab,
);
router.get(
  "/by-slug/:slug/courses/:courseId/reviews",
  CourseTabsController.listPublicCourseReviews,
);
router.get(
  "/by-slug/:slug/courses/:courseId/other-courses-offered",
  CourseTabsController.listPublicOtherCoursesOffered,
);
router.get(
  "/by-slug/:slug/courses/:courseId/clubs-associations/:clubId",
  CourseTabsController.getPublicClubDetail,
);
router.get(
  "/by-slug/:slug/courses/:courseId/clubs-associations",
  CourseTabsController.listPublicClubsAssociations,
);
router.get(
  "/by-slug/:slug/courses/:courseId/eligibility-criteria",
  CourseTabsController.getPublicEligibilityCriteria,
);
router.get(
  "/by-slug/:slug/courses/:courseId/scholarship-details",
  CourseTabsController.getPublicScholarshipDetails,
);
router.get(
  "/by-slug/:slug/courses/:courseId",
  CourseTabsController.getPublicCourseDetail,
);

// ── Hostels (public) ──────────────────────────────────────────────────────────
router.get(
  "/by-slug/:slug/hostels/:hostelId",
  PublicHostelController.getPublicHostelDetail,
);
router.get("/by-slug/:slug/hostels", PublicHostelController.listPublicHostels);

router.get("/:id", PublicCollegeController.getCollegeById);
router.get("/by-slug/:slug", PublicCollegeController.getCollegeBySlug);
router.get("/by-slug/:slug/courses", PublicCollegeController.getCollegeCourses);

export default router;
