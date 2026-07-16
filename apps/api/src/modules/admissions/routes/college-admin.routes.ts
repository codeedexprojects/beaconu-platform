import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.post("/", CollegeAdminAdmissionCycleController.create);
router.get("/", CollegeAdminAdmissionCycleController.list);
router.get("/:id", CollegeAdminAdmissionCycleController.getById);
router.patch("/:id", CollegeAdminAdmissionCycleController.update);
router.delete("/:id", CollegeAdminAdmissionCycleController.remove);

router.get("/:id/courses", CollegeAdminAdmissionCycleController.listCourses);
router.post("/:id/courses", CollegeAdminAdmissionCycleController.attachCourse);
router.patch(
  "/:id/courses/:courseId",
  CollegeAdminAdmissionCycleController.updateCourse,
);
router.delete(
  "/:id/courses/:courseId",
  CollegeAdminAdmissionCycleController.detachCourse,
);

router.get(
  "/:id/courses/:courseId/quotas",
  CollegeAdminAdmissionCycleController.listCourseQuotas,
);
router.post(
  "/:id/courses/:courseId/quotas",
  CollegeAdminAdmissionCycleController.attachCourseQuota,
);
router.patch(
  "/:id/courses/:courseId/quotas/:quotaSeatId",
  CollegeAdminAdmissionCycleController.updateCourseQuota,
);
router.delete(
  "/:id/courses/:courseId/quotas/:quotaSeatId",
  CollegeAdminAdmissionCycleController.detachCourseQuota,
);

router.get(
  "/:id/seat-pools",
  CollegeAdminAdmissionCycleController.listSeatPools,
);
router.post(
  "/:id/seat-pools",
  CollegeAdminAdmissionCycleController.createSeatPool,
);
router.patch(
  "/:id/seat-pools/:poolId",
  CollegeAdminAdmissionCycleController.updateSeatPool,
);
router.delete(
  "/:id/seat-pools/:poolId",
  CollegeAdminAdmissionCycleController.deleteSeatPool,
);

router.get(
  "/:id/documents",
  CollegeAdminAdmissionCycleController.listDocumentRequirements,
);
router.post(
  "/:id/documents",
  CollegeAdminAdmissionCycleController.createDocumentRequirement,
);
router.patch(
  "/:id/documents/:requirementId",
  CollegeAdminAdmissionCycleController.updateDocumentRequirement,
);
router.delete(
  "/:id/documents/:requirementId",
  CollegeAdminAdmissionCycleController.deleteDocumentRequirement,
);

export default router;
