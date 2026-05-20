import { Router } from "express";
import { NewsAlertsPublicController } from "../controllers/news-alerts-public.controller";

const router: Router = Router();

router.get("/", NewsAlertsPublicController.listPublished);
router.get("/:slug", NewsAlertsPublicController.getBySlug);

export default router;
