import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { VideoTestimonialsStudentController } from "../controllers/video-testimonials-student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/", VideoTestimonialsStudentController.listActive);

export default router;
