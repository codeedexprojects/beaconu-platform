import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminMediaKitController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.post("/", CollegeAdminMediaKitController.create);
router.get("/", CollegeAdminMediaKitController.list);
router.patch("/:id", CollegeAdminMediaKitController.update);
router.delete("/:id", CollegeAdminMediaKitController.remove);

export default router;
