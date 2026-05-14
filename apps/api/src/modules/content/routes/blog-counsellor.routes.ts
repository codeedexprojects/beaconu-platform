import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogAuthorController } from "../controllers/blog-author.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("counsellor"),
  BlogAuthorController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("counsellor"),
  BlogAuthorController.listOwn,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("counsellor"),
  BlogAuthorController.getOwn,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("counsellor"),
  BlogAuthorController.update,
);

export default router;
