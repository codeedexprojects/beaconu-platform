import { Router } from "express";
import { EntranceExamsPublicController } from "../controllers/entrance-exams-public.controller";

const router: Router = Router();

router.get("/", EntranceExamsPublicController.listActive);
router.get("/:id", EntranceExamsPublicController.getById);

export default router;
