import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router: Router = Router();

router.get("/", HealthController.check);

export default router;
