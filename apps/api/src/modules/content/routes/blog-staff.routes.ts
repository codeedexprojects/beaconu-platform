import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogAuthorController } from "../controllers/blog-author.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("staff_member"),
  BlogAuthorController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("staff_member"),
  BlogAuthorController.listOwn,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("staff_member"),
  BlogAuthorController.getOwn,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("staff_member"),
  BlogAuthorController.update,
);

export default router;
