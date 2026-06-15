import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CounsellorUploadController } from "../controllers/counsellor.controller";

const router: Router = Router();

router.post(
  "/avatar/presign",
  authenticate,
  authorizeUserType("counsellor"),
  CounsellorUploadController.presignAvatar,
);

router.post(
  "/avatar/verify",
  authenticate,
  authorizeUserType("counsellor"),
  CounsellorUploadController.verifyAvatar,
);

export default router;
