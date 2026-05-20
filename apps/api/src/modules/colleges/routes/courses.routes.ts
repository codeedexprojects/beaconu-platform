import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

// ── Courses CRUD ──────────────────────────────────────────────────────────────
router.get(
  "/",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CollegeRegistrationController.listCourses,
);

router.post(
  "/",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.addCourse,
);

router.patch(
  "/:id",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.updateCourse,
);

router.delete(
  "/:id",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.deleteCourse,
);

// ── Lookups (auth-gated reference data, not sensitive) ────────────────────────
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
