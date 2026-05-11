import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformUsersController } from "../controllers/platform-users.controller";

const router: Router = Router();

router.get(
  "/profiles",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformUsersController.getAllProfiles,
);

export default router;
