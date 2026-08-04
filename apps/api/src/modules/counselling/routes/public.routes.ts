import { Router } from "express";
import { CounsellingPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.post("/", CounsellingPublicController.submitRequest);

export default router;
