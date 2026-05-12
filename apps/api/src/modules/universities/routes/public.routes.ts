import { Router } from "express";
import { UniversityPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.get("/types", UniversityPublicController.listTypes);
router.get("/", UniversityPublicController.listAll);
router.get("/:id", UniversityPublicController.getById);

export default router;
