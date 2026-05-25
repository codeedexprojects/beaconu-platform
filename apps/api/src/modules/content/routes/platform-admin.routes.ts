import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogPlatformAdminController } from "../controllers/platform-admin.controller";
import { BlogAuthorController } from "../controllers/blog-author.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogAuthorController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogPlatformAdminController.listAll,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogPlatformAdminController.getById,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogPlatformAdminController.approve,
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogPlatformAdminController.reject,
);

router.patch(
  "/:id/unpublish",
  authenticate,
  authorizeUserType("platform_admin"),
  BlogPlatformAdminController.unpublish,
);

export default router;
