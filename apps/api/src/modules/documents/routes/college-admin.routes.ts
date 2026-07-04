import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminDocumentsController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

// Direction A — request a document from a student, then verify it
router.post(
  "/submission-requests",
  CollegeAdminDocumentsController.createSubmissionRequest,
);
router.get(
  "/submission-requests",
  CollegeAdminDocumentsController.listSubmissionRequests,
);
router.patch(
  "/submission-requests/:requestId/review",
  CollegeAdminDocumentsController.reviewSubmission,
);

// Direction B — fulfill/reject documents students requested from us
router.get("/requests", CollegeAdminDocumentsController.listDocumentRequests);
router.patch(
  "/requests/:requestId/start-review",
  CollegeAdminDocumentsController.startReview,
);
router.patch(
  "/requests/:requestId/send-for-approval",
  CollegeAdminDocumentsController.sendForApproval,
);
router.patch(
  "/requests/:requestId/approve",
  CollegeAdminDocumentsController.approveDocumentRequest,
);
router.patch(
  "/requests/:requestId/issue",
  CollegeAdminDocumentsController.issueDocumentRequest,
);
router.patch(
  "/requests/:requestId/reject",
  CollegeAdminDocumentsController.rejectDocumentRequest,
);

export default router;
