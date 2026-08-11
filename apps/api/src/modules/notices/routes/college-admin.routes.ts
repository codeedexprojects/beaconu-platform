import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminNoticeController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminNoticeController.list);
router.post("/", CollegeAdminNoticeController.create);
router.get("/:id", CollegeAdminNoticeController.getById);
router.patch("/:id", CollegeAdminNoticeController.update);
router.patch("/:id/archive", CollegeAdminNoticeController.archive);
router.patch("/:id/restore", CollegeAdminNoticeController.restore);

export default router;
