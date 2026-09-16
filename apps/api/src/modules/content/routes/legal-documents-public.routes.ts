import { Router } from "express";
import { LegalDocumentPublicController } from "../controllers/legal-documents.controller";

const router: Router = Router();

router.get("/", LegalDocumentPublicController.list);
router.get("/:docType", LegalDocumentPublicController.getOne);

export default router;
