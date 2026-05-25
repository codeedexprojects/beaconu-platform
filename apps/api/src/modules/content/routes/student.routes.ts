import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("student"),
  BlogPublicController.listPublished,
);
router.get(
  "/:slug",
  authenticate,
  authorizeUserType("student"),
  BlogPublicController.getBySlug,
);

export default router;
