import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { CommunityStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get("/", authenticate, CommunityStudentController.list);
router.post("/", authenticate, CommunityStudentController.create);
router.post("/:id/join", authenticate, CommunityStudentController.join);
router.post("/:id/posts", authenticate, CommunityStudentController.createPost);
router.patch("/:id", authenticate, CommunityStudentController.update);
router.delete(
  "/:id/posts/:postId",
  authenticate,
  CommunityStudentController.deletePost,
);

export default router;
