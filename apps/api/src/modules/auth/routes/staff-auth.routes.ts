import { Router } from 'express';
import { StaffAuthController } from '../controllers/staff-auth.controller';

const router: Router = Router();

router.post('/refresh-token', StaffAuthController.refresh);
router.post('/logout', StaffAuthController.logout);

export default router;
