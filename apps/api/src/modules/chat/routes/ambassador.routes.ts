import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { AmbassadorChatController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("blink_ambassador"));

router.get("/conversations", AmbassadorChatController.listConversations);
router.get("/conversations/:id/messages", AmbassadorChatController.getMessages);
router.post(
  "/conversations/:id/messages",
  AmbassadorChatController.sendMessage,
);
router.patch("/conversations/:id/read", AmbassadorChatController.markRead);

export default router;
