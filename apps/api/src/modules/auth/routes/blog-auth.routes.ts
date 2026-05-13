import { Router } from "express";
import { BlogAuthController } from "../controllers/blog-auth.controller";

const router: Router = Router();

router.post("/register", BlogAuthController.register);
router.post("/login", BlogAuthController.login);
router.post("/refresh", BlogAuthController.refresh);
router.post("/logout", BlogAuthController.logout);

export default router;
