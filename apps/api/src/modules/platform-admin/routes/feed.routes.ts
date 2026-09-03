import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { FeedController } from "../controllers/feed.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  FeedController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  FeedController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  FeedController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  FeedController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  FeedController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  FeedController.activate,
);

export default router;
