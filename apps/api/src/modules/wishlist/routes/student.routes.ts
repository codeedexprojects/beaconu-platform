import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentWishlistController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentWishlistController.add);
router.get("/", StudentWishlistController.list);
router.delete("/:collegeId", StudentWishlistController.remove);

export default router;
