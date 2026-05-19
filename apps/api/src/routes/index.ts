import { Router } from "express";

import adminRoutes from "./admin";
import blinkRoutes from "./blink";
import counsellorRoutes from "./counsellor";
import studentRoutes from "./student";
import collegeRoutes from "./college";
import publicRoutes from "./public";
import blogRoutes from "./blog";
import healthRoutes from "@/modules/health/routes/health.routes";

const router: Router = Router();

router.use("/api/v1/admin", adminRoutes);
router.use("/api/v1/blink", blinkRoutes);
router.use("/api/v1/counsellor", counsellorRoutes);
router.use("/api/v1/student", studentRoutes);
router.use("/api/v1/college", collegeRoutes);
router.use("/api/v1/public", publicRoutes);
router.use("/api/v1/blog", blogRoutes);
router.use("/api/v1/health", healthRoutes);

export default router;
