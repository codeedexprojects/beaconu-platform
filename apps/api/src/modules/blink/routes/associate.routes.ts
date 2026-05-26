import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  registerAssociateEmployeeSchema,
  updateEmployeeStatusSchema,
} from "../validators/blink.validator";
import { AssociateAdminController } from "../controllers/associate-admin.controller";
import { USER_TYPES } from "@/shared/constants";

const router: Router = Router();

router.post(
  "/employees/register",
  validate(registerAssociateEmployeeSchema),
  AssociateAdminController.registerEmployee,
);

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.getProfile,
);
router.get(
  "/employees",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.listEmployees,
);
router.get(
  "/employees/pending",
  authenticate,
  authorizeUserType("blink_associate"),
  AssociateAdminController.listPendingEmployees,
);
router.patch(
  "/employees/:employeeId/status",
  authenticate,
  authorizeUserType("blink_associate"),
  validate(updateEmployeeStatusSchema),
  AssociateAdminController.updateEmployeeStatus,
);

export default router;
