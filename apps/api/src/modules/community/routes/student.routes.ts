import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { CommunityStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get("/", authenticate, CommunityStudentController.list);
router.get("/:id/posts", authenticate, CommunityStudentController.listPosts);
router.post("/", authenticate, CommunityStudentController.create);
router.post("/:id/join", authenticate, CommunityStudentController.join);
router.post("/:id/posts", authenticate, CommunityStudentController.createPost);
router.post(
  "/:id/posts/:postId/share",
  authenticate,
  CommunityStudentController.sharePost,
);
router.post(
  "/:id/posts/:postId/comments",
  authenticate,
  CommunityStudentController.createComment,
);
router.post(
  "/:id/posts/:postId/comments/:commentId/replies",
  authenticate,
  CommunityStudentController.replyToComment,
);
router.post(
  "/:id/posts/:postId/comments/:commentId/like",
  authenticate,
  CommunityStudentController.likeComment,
);
router.patch("/:id", authenticate, CommunityStudentController.update);
router.delete(
  "/:id/posts/:postId",
  authenticate,
  CommunityStudentController.deletePost,
);
router.delete(
  "/:id/posts/:postId/comments/:commentId",
  authenticate,
  CommunityStudentController.deleteComment,
);

export default router;
