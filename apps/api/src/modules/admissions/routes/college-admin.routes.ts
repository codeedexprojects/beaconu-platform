import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAdmissionCycleController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.post("/", CollegeAdminAdmissionCycleController.create);
router.get("/", CollegeAdminAdmissionCycleController.list);
router.get("/:id", CollegeAdminAdmissionCycleController.getById);
router.patch("/:id", CollegeAdminAdmissionCycleController.update);
router.delete("/:id", CollegeAdminAdmissionCycleController.remove);

export default router;
