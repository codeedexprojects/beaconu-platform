import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminNoticeController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const manage = authorize("notices.manage");

router.get("/", manage, CollegeAdminNoticeController.list);
router.post("/", manage, CollegeAdminNoticeController.create);
router.get("/:id", manage, CollegeAdminNoticeController.getById);
router.patch("/:id", manage, CollegeAdminNoticeController.update);
router.patch("/:id/archive", manage, CollegeAdminNoticeController.archive);
router.patch("/:id/restore", manage, CollegeAdminNoticeController.restore);

export default router;
