import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformTicketCollegeAdminController } from "../controllers/platform-ticket-college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.post("/", PlatformTicketCollegeAdminController.create);
router.get("/", PlatformTicketCollegeAdminController.list);
router.get("/:id", PlatformTicketCollegeAdminController.getById);
router.post("/:id/messages", PlatformTicketCollegeAdminController.addMessage);

export default router;
