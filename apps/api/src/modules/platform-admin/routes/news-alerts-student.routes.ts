import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { NewsAlertsPublicController } from "../controllers/news-alerts-public.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("student"),
  NewsAlertsPublicController.listPublished,
);
router.get(
  "/:slug",
  authenticate,
  authorizeUserType("student"),
  NewsAlertsPublicController.getBySlug,
);

export default router;
