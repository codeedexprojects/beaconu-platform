import { Router } from 'express';
import { StudentAuthController } from '../controllers/student-auth.controller';

const router: Router = Router();

router.post('/refresh-token', StudentAuthController.refresh);
router.post('/logout', StudentAuthController.logout);

export default router;
