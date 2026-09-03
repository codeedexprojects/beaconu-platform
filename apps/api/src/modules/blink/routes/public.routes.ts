import { Router } from "express";
import { BlinkPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.get("/:code", BlinkPublicController.resolveReferralCode);

export default router;
