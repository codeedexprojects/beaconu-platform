import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminDocumentsController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("documents.view");
const manage = authorize("documents.manage");

router.post(
  "/submission-requests",
  manage,
  CollegeAdminDocumentsController.createSubmissionRequest,
);
router.get(
  "/submission-requests",
  view,
  CollegeAdminDocumentsController.listSubmissionRequests,
);
router.patch(
  "/submission-requests/:requestId/review",
  manage,
  CollegeAdminDocumentsController.reviewSubmission,
);

router.get(
  "/requests",
  view,
  CollegeAdminDocumentsController.listDocumentRequests,
);
router.patch(
  "/requests/:requestId/approve",
  manage,
  CollegeAdminDocumentsController.approveDocumentRequest,
);
router.patch(
  "/requests/:requestId/issue",
  manage,
  CollegeAdminDocumentsController.issueDocumentRequest,
);
router.patch(
  "/requests/:requestId/reject",
  manage,
  CollegeAdminDocumentsController.rejectDocumentRequest,
);

router.post(
  "/templates",
  manage,
  CollegeAdminDocumentsController.createTemplate,
);
router.get("/templates", view, CollegeAdminDocumentsController.listTemplates);
router.patch(
  "/templates/:templateId",
  manage,
  CollegeAdminDocumentsController.updateTemplate,
);
router.patch(
  "/templates/:templateId/activate",
  manage,
  CollegeAdminDocumentsController.activateTemplate,
);
router.patch(
  "/templates/:templateId/deactivate",
  manage,
  CollegeAdminDocumentsController.deactivateTemplate,
);

export default router;
