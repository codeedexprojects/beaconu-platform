import { Router } from "express";
import { FeedPublicController } from "../controllers/feed-public.controller";

const router: Router = Router();

router.get("/", FeedPublicController.listActive);

export default router;
