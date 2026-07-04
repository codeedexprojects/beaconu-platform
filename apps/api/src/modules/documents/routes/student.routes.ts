import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentDocumentsController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

// Direction A — documents the college has requested from this student
router.get(
  "/submission-requests",
  StudentDocumentsController.listSubmissionRequests,
);
router.patch(
  "/submission-requests/:requestId/submit",
  StudentDocumentsController.submitDocument,
);

// Direction B — official documents this student has requested from the college
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

export default router;
