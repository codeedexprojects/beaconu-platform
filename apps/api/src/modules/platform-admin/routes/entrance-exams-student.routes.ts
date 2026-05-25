import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { EntranceExamsPublicController } from "../controllers/entrance-exams-public.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("student"),
  EntranceExamsPublicController.listActive,
);
router.get(
  "/:id",
  authenticate,
  authorizeUserType("student"),
  EntranceExamsPublicController.getById,
);

export default router;
