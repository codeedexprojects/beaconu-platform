import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];

// ── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", ...staffAuth, CollegeRegistrationController.getProfile);
router.patch(
  "/profile",
  ...staffAuth,
  CollegeRegistrationController.updateProfile,
);
router.get(
  "/check-subdomain/:slug",
  ...staffAuth,
  CollegeRegistrationController.checkSubdomain,
);
router.patch(
  "/subdomain",
  ...staffAuth,
  CollegeRegistrationController.setSubdomain,
);
router.patch(
  "/profile/finalize",
  ...staffAuth,
  CollegeRegistrationController.finalize,
);
router.post(
  "/profile/submit",
  ...staffAuth,
  CollegeRegistrationController.finalize,
);

// ── Campuses ─────────────────────────────────────────────────────────────────
router.get(
  "/campuses",
  ...staffAuth,
  CollegeRegistrationController.listCampuses,
);
router.post("/campuses", ...staffAuth, CollegeRegistrationController.addCampus);
router.patch(
  "/campuses/:id",
  ...staffAuth,
  CollegeRegistrationController.updateCampus,
);
router.delete(
  "/campuses/:id",
  ...staffAuth,
  CollegeRegistrationController.deleteCampus,
);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get("/courses", ...staffAuth, CollegeRegistrationController.listCourses);
router.post("/courses", ...staffAuth, CollegeRegistrationController.addCourse);
router.patch(
  "/courses/:id",
  ...staffAuth,
  CollegeRegistrationController.updateCourse,
);
router.delete(
  "/courses/:id",
  ...staffAuth,
  CollegeRegistrationController.deleteCourse,
);

// ── Lookups (auth required for convenience, data is not sensitive) ─────────────
router.get(
  "/lookups/streams",
  ...staffAuth,
  CollegeRegistrationController.getStreams,
);
router.get(
  "/lookups/study-levels",
  ...staffAuth,
  CollegeRegistrationController.getStudyLevels,
);
router.get(
  "/lookups/program-types",
  ...staffAuth,
  CollegeRegistrationController.getProgramTypes,
);
router.get(
  "/lookups/universities",
  ...staffAuth,
  CollegeRegistrationController.getUniversities,
);

export default router;
