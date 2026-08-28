import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminTicketController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const manage = authorize("support.manage");

router.get("/", manage, CollegeAdminTicketController.list);
router.get("/:id", manage, CollegeAdminTicketController.getById);
router.post("/:id/messages", manage, CollegeAdminTicketController.addMessage);
router.patch("/:id/status", manage, CollegeAdminTicketController.updateStatus);

export default router;
