import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { VideoTestimonialsController } from "../controllers/video-testimonials.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  VideoTestimonialsController.listAll,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  VideoTestimonialsController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.view"),
  VideoTestimonialsController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  VideoTestimonialsController.update,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  VideoTestimonialsController.deactivate,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("content.manage"),
  VideoTestimonialsController.activate,
);

export default router;
