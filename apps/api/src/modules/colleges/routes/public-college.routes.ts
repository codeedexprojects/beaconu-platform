import { Router } from "express";
import { PublicCollegeController } from "../controllers/public-college.controller";

const router: Router = Router();

router.get("/", PublicCollegeController.getColleges);
router.get("/:id", PublicCollegeController.getCollegeById);
router.get("/by-slug/:slug", PublicCollegeController.getCollegeBySlug);
router.get("/by-slug/:slug/courses", PublicCollegeController.getCollegeCourses);

export default router;
