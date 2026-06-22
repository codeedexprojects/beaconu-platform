import { Router } from "express";
import { CounsellingWebhookController } from "../controllers/webhook.controller";

const router: Router = Router();

router.post("/razorpay", CounsellingWebhookController.handleRazorpayWebhook);

export default router;
