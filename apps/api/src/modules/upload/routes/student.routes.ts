import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentUploadController } from "../controllers/student.controller";

const router: Router = Router();

router.post(
  "/avatar/presign",
  authenticate,
  authorizeUserType("student"),
  StudentUploadController.presignAvatar,
);

router.post(
  "/avatar/verify",
  authenticate,
  authorizeUserType("student"),
  StudentUploadController.verifyAvatar,
);

router.post(
  "/refund-proof/presign",
  authenticate,
  authorizeUserType("student"),
  StudentUploadController.presignRefundProof,
);

router.post(
  "/refund-proof/verify",
  authenticate,
  authorizeUserType("student"),
  StudentUploadController.verifyRefundProof,
);

export default router;
