import { Router } from "express";

import blogAuthRoutes from "@/modules/auth/routes/blog-auth.routes";
import blogAuthorRoutes from "@/modules/content/routes/blog-author.routes";

const router: Router = Router();

router.use("/auth", blogAuthRoutes);
router.use("/author/blogs", blogAuthorRoutes);

export default router;
