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

router.get("/my-applications", StudentApplicationController.listMyApplications);
router.get(
  "/my-applications/:applicationId",
  StudentApplicationController.getMyApplicationById,
);

router.get("/status", StudentApplicationController.getStatusAllCycles);

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
router.patch(
  "/my-applications/:applicationId/academic-records/tenth-grade",
  StudentApplicationController.updateTenthGradeDetails,
);
router.patch(
  "/my-applications/:applicationId/academic-records/twelfth-grade",
  StudentApplicationController.updateTwelfthGradeDetails,
);
router.patch(
  "/my-applications/:applicationId/academic-records/undergraduate",
  StudentApplicationController.updateUndergraduateDetails,
);
router.patch(
  "/my-applications/:applicationId/achievements-details",
  StudentApplicationController.updateAchievementsDetails,
);
router.patch(
  "/my-applications/:applicationId/entrance-exam-details",
  StudentApplicationController.updateEntranceExamDetails,
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

router.post("/:id/application", StudentApplicationController.start);
router.get("/:id/application", StudentApplicationController.listForCycle);
router.get("/:id/application/status", StudentApplicationController.getStatus);

export default router;
