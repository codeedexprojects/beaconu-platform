import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { StarterGuideVideosController } from "../controllers/starter-guide-videos.controller";

const router: Router = Router();

router.post(
  "/presign",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  StarterGuideVideosController.presignUpload,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  StarterGuideVideosController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  StarterGuideVideosController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  StarterGuideVideosController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  StarterGuideVideosController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  StarterGuideVideosController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  StarterGuideVideosController.activate,
);

export default router;
