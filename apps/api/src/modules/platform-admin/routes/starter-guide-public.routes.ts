import { Router } from "express";
import { StarterGuidePublicController } from "../controllers/starter-guide-public.controller";

const router: Router = Router();

router.get("/", StarterGuidePublicController.listActive);
router.get("/:id", StarterGuidePublicController.getById);

export default router;
