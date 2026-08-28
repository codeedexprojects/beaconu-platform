import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("admissions.view");
const manage = authorize("admissions.manage");

router.post("/", manage, CollegeAdminAdmissionCycleController.create);
router.get("/", view, CollegeAdminAdmissionCycleController.list);
router.get("/:id", view, CollegeAdminAdmissionCycleController.getById);
router.patch("/:id", manage, CollegeAdminAdmissionCycleController.update);
router.delete("/:id", manage, CollegeAdminAdmissionCycleController.remove);

router.get(
  "/:id/courses",
  view,
  CollegeAdminAdmissionCycleController.listCourses,
);
router.post(
  "/:id/courses",
  manage,
  CollegeAdminAdmissionCycleController.attachCourse,
);
router.patch(
  "/:id/courses/:courseId",
  manage,
  CollegeAdminAdmissionCycleController.updateCourse,
);
router.delete(
  "/:id/courses/:courseId",
  manage,
  CollegeAdminAdmissionCycleController.detachCourse,
);

router.get(
  "/:id/courses/:courseId/quotas",
  view,
  CollegeAdminAdmissionCycleController.listCourseQuotas,
);
router.post(
  "/:id/courses/:courseId/quotas",
  manage,
  CollegeAdminAdmissionCycleController.attachCourseQuota,
);
router.patch(
  "/:id/courses/:courseId/quotas/:quotaSeatId",
  manage,
  CollegeAdminAdmissionCycleController.updateCourseQuota,
);
router.delete(
  "/:id/courses/:courseId/quotas/:quotaSeatId",
  manage,
  CollegeAdminAdmissionCycleController.detachCourseQuota,
);

router.get(
  "/:id/seat-pools",
  view,
  CollegeAdminAdmissionCycleController.listSeatPools,
);
router.post(
  "/:id/seat-pools",
  manage,
  CollegeAdminAdmissionCycleController.createSeatPool,
);
router.patch(
  "/:id/seat-pools/:poolId",
  manage,
  CollegeAdminAdmissionCycleController.updateSeatPool,
);
router.delete(
  "/:id/seat-pools/:poolId",
  manage,
  CollegeAdminAdmissionCycleController.deleteSeatPool,
);

router.get(
  "/:id/documents",
  view,
  CollegeAdminAdmissionCycleController.listDocumentRequirements,
);
router.post(
  "/:id/documents",
  manage,
  CollegeAdminAdmissionCycleController.createDocumentRequirement,
);
router.patch(
  "/:id/documents/:requirementId",
  manage,
  CollegeAdminAdmissionCycleController.updateDocumentRequirement,
);
router.delete(
  "/:id/documents/:requirementId",
  manage,
  CollegeAdminAdmissionCycleController.deleteDocumentRequirement,
);

export default router;
