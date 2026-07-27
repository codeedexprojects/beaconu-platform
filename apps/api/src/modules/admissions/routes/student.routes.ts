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

// No cycle id given — status across every cycle the student has ever
// applied to. Registered before "/:id" for the same wildcard-ordering
// reason as my-applications above.
router.get("/status", StudentApplicationController.getStatusAllCycles);

// A student can have several Applications per cycle now (one per course,
// Plan N) — every action beyond "list for this cycle" / "start a new one"
// targets a specific applicationId directly, not the cycle. Registered
// before "/:id" for the same wildcard-ordering reason as my-applications
// above.
router.get(
  "/my-applications/:applicationId/details",
  StudentApplicationController.getFormDetails,
);
router.get(
  "/my-applications/:applicationId/summary",
  StudentApplicationController.getPaymentSummary,
);
router.post(
  "/my-applications/:applicationId/courses",
  StudentApplicationController.addCourse,
);
router.delete(
  "/my-applications/:applicationId/courses/:appCourseId",
  StudentApplicationController.withdrawCourse,
);
router.patch(
  "/my-applications/:applicationId/courses/:appCourseId/quota",
  StudentApplicationController.changeCourseQuota,
);
router.patch(
  "/my-applications/:applicationId/personal-details",
  StudentApplicationController.updatePersonalDetails,
);
router.patch(
  "/my-applications/:applicationId/family-details",
  StudentApplicationController.updateFamilyDetails,
);
router.patch(
  "/my-applications/:applicationId/address-details",
  StudentApplicationController.updateAddressDetails,
);
router.patch(
  "/my-applications/:applicationId/qualification-details",
  StudentApplicationController.updateQualificationDetails,
);
router.get(
  "/my-applications/:applicationId/documents/required",
  StudentApplicationController.listRequiredDocuments,
);
router.get(
  "/my-applications/:applicationId/documents",
  StudentApplicationController.listUploadedDocuments,
);
router.post(
  "/my-applications/:applicationId/documents",
  StudentApplicationController.registerDocument,
);
router.patch(
  "/my-applications/:applicationId/declaration",
  StudentApplicationController.updateDeclaration,
);
router.post(
  "/my-applications/:applicationId/submit",
  StudentApplicationController.submit,
);

router.get("/:id", StudentAdmissionCycleController.getById);
router.get("/:id/courses", StudentAdmissionCycleController.listCourseCatalogue);

// Start a new Application under this cycle (course-gated, not
// idempotent-per-cycle anymore — see ApplicationService.start()).
router.post("/:id/application", StudentApplicationController.start);
// List every Application the student has for this cycle (can be more
// than one, Plan N).
router.get("/:id/application", StudentApplicationController.listForCycle);
// null if no application started yet; else one status + pending action
// per application the student has for this cycle.
router.get("/:id/application/status", StudentApplicationController.getStatus);

export default router;
