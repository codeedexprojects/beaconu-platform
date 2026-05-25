import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { EducationLoansController } from "../controllers/financial-aid-loans.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  EducationLoansController.activate,
);

export default router;
