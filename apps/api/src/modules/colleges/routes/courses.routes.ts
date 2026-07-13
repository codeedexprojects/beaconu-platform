import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";
import { CourseTabsController } from "../controllers/course-tabs.controller";
import { CourseQuotasController } from "../controllers/course-quotas.controller";

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

// ── Course Quotas ─────────────────────────────────────────────────────────────
router.get(
  "/:id/quotas",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CourseQuotasController.listCourseQuotas,
);

router.post(
  "/:id/quotas",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CourseQuotasController.attachQuota,
);

router.patch(
  "/:id/quotas/:courseQuotaId",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CourseQuotasController.updateCourseQuota,
);

router.delete(
  "/:id/quotas/:courseQuotaId",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CourseQuotasController.detachQuota,
);

// ── Course Tabs ───────────────────────────────────────────────────────────────
router.get(
  "/:id/tabs",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CourseTabsController.getTabsAdmin,
);

router.get(
  "/:id/tabs/:tabName",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CourseTabsController.getTabAdmin,
);

router.patch(
  "/:id/tabs/:tabName",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CourseTabsController.updateTabAdmin,
);

export default router;
