import { authenticate } from "@/shared/middleware/authenticate";
import { Router } from "express";
import { CommunityCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.get("/", authenticate, CommunityCollegeAdminController.list);
router.post("/", authenticate, CommunityCollegeAdminController.create);
router.post("/:id/join", authenticate, CommunityCollegeAdminController.join);
router.post(
  "/:id/posts",
  authenticate,
  CommunityCollegeAdminController.createPost,
);
router.patch("/:id", authenticate, CommunityCollegeAdminController.update);
router.delete(
  "/:id/posts/:postId",
  authenticate,
  CommunityCollegeAdminController.deletePost,
);

export default router;
