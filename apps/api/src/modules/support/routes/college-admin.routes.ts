import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminTicketController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminTicketController.list);
router.get("/:id", CollegeAdminTicketController.getById);
router.post("/:id/messages", CollegeAdminTicketController.addMessage);
router.patch("/:id/status", CollegeAdminTicketController.updateStatus);

export default router;
