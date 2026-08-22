import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { InstitutesOfNationalImportanceController } from "../controllers/institutes-of-national-importance.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.view"),
  InstitutesOfNationalImportanceController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.manage"),
  InstitutesOfNationalImportanceController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.view"),
  InstitutesOfNationalImportanceController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.manage"),
  InstitutesOfNationalImportanceController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.manage"),
  InstitutesOfNationalImportanceController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("institutes-of-national-importance.manage"),
  InstitutesOfNationalImportanceController.activate,
);

export default router;
