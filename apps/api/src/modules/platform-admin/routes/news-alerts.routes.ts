import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { NewsAlertsController } from "../controllers/news-alerts.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  NewsAlertsController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  NewsAlertsController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  NewsAlertsController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  NewsAlertsController.update,
);

router.patch(
  "/:id/publish",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  NewsAlertsController.publish,
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  NewsAlertsController.archive,
);

router.patch(
  "/:id/unarchive",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  NewsAlertsController.unarchive,
);

export default router;
