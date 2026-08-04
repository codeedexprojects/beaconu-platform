import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentDocumentsController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get(
  "/submission-requests",
  StudentDocumentsController.listSubmissionRequests,
);
router.patch(
  "/submission-requests/:requestId/submit",
  StudentDocumentsController.submitDocument,
);

router.post("/requests", StudentDocumentsController.createDocumentRequest);
router.get("/requests", StudentDocumentsController.listDocumentRequests);
router.get(
  "/requests/:requestId",
  StudentDocumentsController.getDocumentRequest,
);
router.patch(
  "/requests/:requestId/resubmit",
  StudentDocumentsController.resubmitDocumentRequest,
);

router.get("/templates", StudentDocumentsController.listTemplates);

export default router;
