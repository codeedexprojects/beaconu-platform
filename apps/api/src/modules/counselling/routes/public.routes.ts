import { Router } from "express";
import { CounsellingPublicController } from "../controllers/public.controller";

const router: Router = Router();

// Public — no auth required
router.post("/", CounsellingPublicController.submitRequest);

export default router;
