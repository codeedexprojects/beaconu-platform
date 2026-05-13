import { Router } from "express";
import { BlogPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.get("/", BlogPublicController.listPublished);

router.get("/:slug", BlogPublicController.getBySlug);

export default router;
