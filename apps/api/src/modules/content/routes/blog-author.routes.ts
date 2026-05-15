import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { BlogAuthorController } from "../controllers/blog-author.controller";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorizeUserType("blog_author"),
  BlogAuthorController.submit,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("blog_author"),
  BlogAuthorController.listOwn,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("blog_author"),
  BlogAuthorController.getOwn,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("blog_author"),
  BlogAuthorController.update,
);

export default router;
