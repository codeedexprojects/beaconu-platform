import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlinkUploadController } from "../controllers/blink.controller";

const router: Router = Router();

router.post(
  "/avatar/presign",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee", "blink_ambassador"),
  BlinkUploadController.presignAvatar,
);

router.post(
  "/avatar/verify",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee", "blink_ambassador"),
  BlinkUploadController.verifyAvatar,
);

router.delete(
  "/file",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee", "blink_ambassador"),
  BlinkUploadController.removeFile,
);

export default router;
