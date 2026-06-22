import { Router } from "express";
import { StarterGuideVideosPublicController } from "../controllers/starter-guide-videos-public.controller";

const router: Router = Router();

router.get("/", StarterGuideVideosPublicController.listActive);
router.get("/:id", StarterGuideVideosPublicController.getById);

export default router;
