import { Router } from "express";
import { PublicCollegeController } from "../controllers/public-college.controller";
import { CourseTabsController } from "../controllers/course-tabs.controller";

const router: Router = Router();

router.get("/filters", PublicCollegeController.getFilters);
router.get("/", PublicCollegeController.getColleges);
router.get(
  "/:collegeId/section/:sectionName",
  PublicCollegeController.getCollegeSection,
);
router.get("/:collegeId/summary", PublicCollegeController.getCollegeSummary);

// ── Course Detail + Tabs (public) ─────────────────────────────────────────────
router.get(
  "/by-slug/:slug/courses/:courseId/tabs/:tabName",
  CourseTabsController.getPublicCourseTab,
);
router.get(
  "/by-slug/:slug/courses/:courseId",
  CourseTabsController.getPublicCourseDetail,
);

router.get("/:id", PublicCollegeController.getCollegeById);
router.get("/by-slug/:slug", PublicCollegeController.getCollegeBySlug);
router.get("/by-slug/:slug/courses", PublicCollegeController.getCollegeCourses);

export default router;
