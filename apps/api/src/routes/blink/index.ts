import { Router } from "express";

import blinkAuthRoutes from "@/modules/auth/routes/blink-auth.routes";
import blinkAssociateRoutes from "@/modules/blink/routes/associate.routes";
import blinkAmbassadorRoutes from "@/modules/blink/routes/ambassador.routes";
import blinkEmployeeRoutes from "@/modules/blink/routes/associate-employee.routes";
import blinkSharedRoutes from "@/modules/blink/routes/shared.routes";

const router: Router = Router();

router.use("/auth", blinkAuthRoutes);
router.use("/associate", blinkAssociateRoutes);
router.use("/ambassador", blinkAmbassadorRoutes);
router.use("/employee", blinkEmployeeRoutes);
router.use("/colleges", blinkSharedRoutes);

export default router;
