import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { EducationLoansController } from "../controllers/financial-aid-loans.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  EducationLoansController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  EducationLoansController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  EducationLoansController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  EducationLoansController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  EducationLoansController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  EducationLoansController.activate,
);

export default router;
