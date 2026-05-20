import { Router } from "express";
import { NewsAlertsController } from "../controllers/news-alerts.controller";
import { authorize } from "@/shared/middleware/authorize";

const router: Router = Router();

router.get(
  "/",
  authorize("platform.admin.manage"),
  NewsAlertsController.listAll,
);

export default router;
