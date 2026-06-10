import { Router } from "express";
import counsellingWebhookRoutes from "@/modules/counselling/routes/webhook.routes";

const router: Router = Router();

router.use("/counselling", counsellingWebhookRoutes);

export default router;
