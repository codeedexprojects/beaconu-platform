import { Router } from "express";

import adminRoutes from "./admin";
import blinkRoutes from "./blink";
import counsellorRoutes from "./counsellor";
import studentRoutes from "./student";
import collegeRoutes from "./college";
import publicRoutes from "./public";
import blogRoutes from "./blog";
import healthRoutes from "@/modules/health/routes/health.routes";
import blogStaffRoutes from "@/modules/content/routes/blog-staff.routes";
import blogCounsellorRoutes from "@/modules/content/routes/blog-counsellor.routes";
import blogStudentRoutes from "@/modules/content/routes/student.routes";
import blogAuthorRoutes from "@/modules/content/routes/blog-author.routes";

const router: Router = Router();

router.use("/api/v1/admin", adminRoutes);
router.use("/api/v1/blink", blinkRoutes);
router.use("/api/v1/counsellor", counsellorRoutes);
router.use("/api/v1/student", studentRoutes);
router.use("/api/v1/college", collegeRoutes);
router.use("/api/v1/public", publicRoutes);
router.use("/api/v1/blog", blogRoutes);
router.use("/api/v1/health", healthRoutes);
router.use("/api/v1/staff/blogs", blogStaffRoutes);
router.use("/api/v1/counsellor/blogs", blogCounsellorRoutes);
router.use("/api/v1/student/blogs", blogStudentRoutes);
router.use("/api/v1/blog-author/blogs", blogAuthorRoutes);

export default router;
