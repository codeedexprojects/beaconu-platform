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
import { FeeStructuresController } from "../controllers/fee-structures.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

router.get(
  "/",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CollegeRegistrationController.listCourses,
);

router.get(
  "/minimal",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CollegeRegistrationController.listCoursesMinimal,
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

router.get(
  "/:id/fee-structures",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  FeeStructuresController.listFeeStructures,
);

router.post(
  "/:id/fee-structures",
  ...staffWriteAuth,
  authorize("academics.manage"),
  FeeStructuresController.createFeeStructure,
);

router.patch(
  "/:id/fee-structures/:feeStructureId",
  ...staffWriteAuth,
  authorize("academics.manage"),
  FeeStructuresController.updateFeeStructure,
);

router.delete(
  "/:id/fee-structures/:feeStructureId",
  ...staffWriteAuth,
  authorize("academics.manage"),
  FeeStructuresController.deleteFeeStructure,
);

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
