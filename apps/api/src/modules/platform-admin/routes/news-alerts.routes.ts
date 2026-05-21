import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { NewsAlertsController } from "../controllers/news-alerts.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.update,
);

router.patch(
  "/:id/publish",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.publish,
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeUserType("platform_admin"),
  NewsAlertsController.archive,
);

export default router;
