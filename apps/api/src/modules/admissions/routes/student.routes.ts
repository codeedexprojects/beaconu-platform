import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import {
  StudentAdmissionCycleController,
  StudentApplicationController,
} from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/", StudentAdmissionCycleController.list);

// Registered before "/:id" — otherwise Express would match the literal
// "my-applications" segment as a cycle id, since ":id" is a single-segment
// wildcard evaluated in route-registration order.
router.get("/my-applications", StudentApplicationController.listMyApplications);
router.get(
  "/my-applications/:applicationId",
  StudentApplicationController.getMyApplicationById,
);

router.get("/:id", StudentAdmissionCycleController.getById);
router.get("/:id/courses", StudentAdmissionCycleController.listCourseCatalogue);

router.post("/:id/application", StudentApplicationController.start);
router.get("/:id/application", StudentApplicationController.getMine);

router.get(
  "/:id/courses/:courseId/quota-options",
  StudentApplicationController.listQuotaOptions,
);

router.get(
  "/:id/application/courses",
  StudentApplicationController.listCourses,
);
router.post("/:id/application/courses", StudentApplicationController.addCourse);
router.delete(
  "/:id/application/courses/:appCourseId",
  StudentApplicationController.withdrawCourse,
);
router.patch(
  "/:id/application/courses/:appCourseId/quota",
  StudentApplicationController.changeCourseQuota,
);

router.get(
  "/:id/application/summary",
  StudentApplicationController.getPaymentSummary,
);

router.patch(
  "/:id/application/personal-details",
  StudentApplicationController.updatePersonalDetails,
);
router.patch(
  "/:id/application/family-details",
  StudentApplicationController.updateFamilyDetails,
);
router.patch(
  "/:id/application/address-details",
  StudentApplicationController.updateAddressDetails,
);
router.patch(
  "/:id/application/qualification-details",
  StudentApplicationController.updateQualificationDetails,
);

router.get(
  "/:id/application/documents/required",
  StudentApplicationController.listRequiredDocuments,
);
router.get(
  "/:id/application/documents",
  StudentApplicationController.listUploadedDocuments,
);
router.post(
  "/:id/application/documents",
  StudentApplicationController.registerDocument,
);

router.patch(
  "/:id/application/declaration",
  StudentApplicationController.updateDeclaration,
);
router.post("/:id/application/submit", StudentApplicationController.submit);

export default router;
