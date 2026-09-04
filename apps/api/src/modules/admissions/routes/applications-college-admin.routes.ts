import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { ApplicationsCollegeAdminController } from "../controllers/applications-college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("admissions.view");
const manage = authorize("admissions.manage");

router.get("/", view, ApplicationsCollegeAdminController.list);
router.get(
  "/pending-enrollment",
  view,
  ApplicationsCollegeAdminController.listPendingEnrollment,
);
router.get(
  "/pending-shortlist",
  view,
  ApplicationsCollegeAdminController.listPendingShortlist,
);
router.get(
  "/pending-shortlist/:applicationCourseId",
  view,
  ApplicationsCollegeAdminController.getPendingShortlistDetail,
);
router.get(
  "/documents/under-review",
  view,
  ApplicationsCollegeAdminController.listDocumentsUnderReview,
);
router.get(
  "/documents/partially-verified",
  view,
  ApplicationsCollegeAdminController.listPartiallyVerifiedDocuments,
);
router.get(
  "/documents/:applicationId/verification-detail",
  view,
  ApplicationsCollegeAdminController.getDocumentVerificationDetail,
);
router.patch(
  "/documents/:documentId/verify",
  manage,
  ApplicationsCollegeAdminController.verifyDocument,
);
router.patch(
  "/documents/:documentId/reject",
  manage,
  ApplicationsCollegeAdminController.rejectDocument,
);
router.get("/:id", view, ApplicationsCollegeAdminController.getById);
router.post(
  "/courses/:applicationCourseId/enroll",
  manage,
  ApplicationsCollegeAdminController.enrollCourse,
);
router.patch(
  "/courses/:applicationCourseId/reject",
  manage,
  ApplicationsCollegeAdminController.rejectCourse,
);

export default router;
