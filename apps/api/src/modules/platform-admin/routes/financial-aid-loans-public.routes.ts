import { Router } from "express";
import { EducationLoansPublicController } from "../controllers/financial-aid-loans-public.controller";

const router: Router = Router();

router.get("/", EducationLoansPublicController.listActive);
router.get("/:id", EducationLoansPublicController.getById);

export default router;
