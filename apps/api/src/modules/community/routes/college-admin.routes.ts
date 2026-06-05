import { authenticate } from "@/shared/middleware/authenticate";
import { Router } from "express";
import { CommunityCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.get("/", authenticate, CommunityCollegeAdminController.list);
router.get("/joined", authenticate, CommunityCollegeAdminController.listJoined);
router.get("/my", authenticate, CommunityCollegeAdminController.listMyCreated);
router.get(
  "/:id/posts",
  authenticate,
  CommunityCollegeAdminController.listPosts,
);
router.post("/", authenticate, CommunityCollegeAdminController.create);
router.post("/:id/join", authenticate, CommunityCollegeAdminController.join);
router.post(
  "/:id/posts",
  authenticate,
  CommunityCollegeAdminController.createPost,
);
router.post(
  "/:id/posts/:postId/share",
  authenticate,
  CommunityCollegeAdminController.sharePost,
);
router.post(
  "/:id/posts/:postId/comments",
  authenticate,
  CommunityCollegeAdminController.createComment,
);
router.post(
  "/:id/posts/:postId/comments/:commentId/replies",
  authenticate,
  CommunityCollegeAdminController.replyToComment,
);
router.post(
  "/:id/posts/:postId/comments/:commentId/like",
  authenticate,
  CommunityCollegeAdminController.likeComment,
);
router.patch("/:id", authenticate, CommunityCollegeAdminController.update);
router.delete(
  "/:id/posts/:postId",
  authenticate,
  CommunityCollegeAdminController.deletePost,
);
router.delete(
  "/:id/posts/:postId/comments/:commentId",
  authenticate,
  CommunityCollegeAdminController.deleteComment,
);

export default router;
