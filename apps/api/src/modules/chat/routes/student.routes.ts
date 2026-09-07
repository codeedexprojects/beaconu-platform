import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentChatController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/ambassadors", StudentChatController.listAmbassadors);
router.post("/conversations", StudentChatController.startConversation);
router.get("/conversations", StudentChatController.listConversations);
router.get("/conversations/:id/messages", StudentChatController.getMessages);
router.post("/conversations/:id/messages", StudentChatController.sendMessage);
router.patch("/conversations/:id/read", StudentChatController.markRead);

export default router;
