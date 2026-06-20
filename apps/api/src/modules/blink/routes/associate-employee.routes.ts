import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  referralListQuerySchema,
  universityListQuerySchema,
} from "../validators/blink.validator";
import { AssociateEmployeeController } from "../controllers/associate-employee.controller";

const router: Router = Router();

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getProfile,
);

router.get(
  "/performance",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getPerformance,
);

router.get(
  "/referrals",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(referralListQuerySchema, "query"),
  AssociateEmployeeController.listReferrals,
);

router.get(
  "/referrals/:referralId",
  authenticate,
  authorizeUserType("blink_employee"),
  AssociateEmployeeController.getStudentByReferral,
);

router.get(
  "/universities",
  authenticate,
  authorizeUserType("blink_employee"),
  validate(universityListQuerySchema, "query"),
  AssociateEmployeeController.listUniversities,
);

export default router;
