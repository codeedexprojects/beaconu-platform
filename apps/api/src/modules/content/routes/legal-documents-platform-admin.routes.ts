import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { LegalDocumentPlatformAdminController } from "../controllers/legal-documents.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("platform_admin"));

router.get(
  "/",
  authorize("content.view"),
  LegalDocumentPlatformAdminController.list,
);
router.get(
  "/:docType",
  authorize("content.view"),
  LegalDocumentPlatformAdminController.getOne,
);
router.put(
  "/:docType",
  authorize("content.manage"),
  LegalDocumentPlatformAdminController.upsert,
);
router.patch(
  "/:docType/status",
  authorize("content.manage"),
  LegalDocumentPlatformAdminController.setStatus,
);

export default router;
