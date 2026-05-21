import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { EntranceExamsController } from "../controllers/entrance-exams.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  EntranceExamsController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  EntranceExamsController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  EntranceExamsController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  EntranceExamsController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  EntranceExamsController.deactivate,
);

export default router;
