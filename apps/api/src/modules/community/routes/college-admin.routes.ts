import { authenticate } from "@/shared/middleware/authenticate";
import { authorize } from "@/shared/middleware/authorize";
import { Router } from "express";
import { CommunityCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();
const moderate = authorize("community.manage");

// Participation (join/post/like/comment) is open to any authenticated staff
// member — this is self-service use of the community, not an admin feature.
// Only moderation actions (edit/delete someone else's content) are gated.
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
  "/:id/posts/:postId/like",
  authenticate,
  CommunityCollegeAdminController.likePost,
);
router.post(
  "/:id/posts/:postId/dislike",
  authenticate,
  CommunityCollegeAdminController.dislikePost,
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
router.patch(
  "/:id",
  authenticate,
  moderate,
  CommunityCollegeAdminController.update,
);
router.delete(
  "/:id/posts/:postId",
  authenticate,
  moderate,
  CommunityCollegeAdminController.deletePost,
);
router.delete(
  "/:id/posts/:postId/comments/:commentId",
  authenticate,
  moderate,
  CommunityCollegeAdminController.deleteComment,
);

export default router;
