import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminMediaKitController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const manage = authorize("media-kit.manage");

router.post("/", manage, CollegeAdminMediaKitController.create);
router.get("/", manage, CollegeAdminMediaKitController.list);
router.patch("/:id", manage, CollegeAdminMediaKitController.update);
router.delete("/:id", manage, CollegeAdminMediaKitController.remove);

export default router;
