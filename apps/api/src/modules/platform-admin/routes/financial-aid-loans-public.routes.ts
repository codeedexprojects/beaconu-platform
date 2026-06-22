import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { EducationLoansPublicController } from "../controllers/financial-aid-loans-public.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("student"),
  EducationLoansPublicController.listActive,
);
router.get(
  "/:id",
  authenticate,
  authorizeUserType("student"),
  EducationLoansPublicController.getById,
);

export default router;
