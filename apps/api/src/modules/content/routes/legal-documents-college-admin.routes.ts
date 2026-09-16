import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeLegalDocumentCollegeAdminController } from "../controllers/college-legal-documents.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get(
  "/",
  authorize("profile.view"),
  CollegeLegalDocumentCollegeAdminController.list,
);
router.get(
  "/:docType",
  authorize("profile.view"),
  CollegeLegalDocumentCollegeAdminController.getOne,
);
router.put(
  "/:docType",
  authorize("profile.edit"),
  CollegeLegalDocumentCollegeAdminController.upsert,
);
router.patch(
  "/:docType/status",
  authorize("profile.edit"),
  CollegeLegalDocumentCollegeAdminController.setStatus,
);

export default router;
