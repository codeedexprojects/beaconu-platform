import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentTicketController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentTicketController.create);
router.get("/", StudentTicketController.list);
router.get("/:id", StudentTicketController.getById);
router.post("/:id/messages", StudentTicketController.addMessage);

export default router;
