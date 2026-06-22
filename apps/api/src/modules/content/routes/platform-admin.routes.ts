import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { BlogPlatformAdminController } from "../controllers/platform-admin.controller";
import { BlogAuthorController } from "../controllers/blog-author.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  BlogAuthorController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  BlogPlatformAdminController.listAll,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  BlogPlatformAdminController.getById,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  BlogPlatformAdminController.approve,
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  BlogPlatformAdminController.reject,
);

router.patch(
  "/:id/unpublish",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  BlogPlatformAdminController.unpublish,
);

export default router;
