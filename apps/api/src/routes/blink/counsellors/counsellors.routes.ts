import { Router } from 'express';
import { CounsellorController } from '@/modules/blink/counsellors/counsellors.controller';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';
import counsellorsAuthRoutes from '@/modules/blink/counsellors/auth/counsellors-auth.routes';

const router: Router = Router();

// Counsellor auth
router.use('/auth', counsellorsAuthRoutes);

// Counsellor self-service (authenticated as counsellor)
router.get('/me', authenticate, authorizeUserType('counsellor'), CounsellorController.getMe);
router.patch('/me', authenticate, authorizeUserType('counsellor'), CounsellorController.updateMe);

// Platform admin management
router.get('/', authenticate, authorizeUserType('platform_admin'), CounsellorController.listAll);
router.get('/:id', authenticate, authorizeUserType('platform_admin'), CounsellorController.getById);
router.patch('/:id/status', authenticate, authorizeUserType('platform_admin'), CounsellorController.updateStatus);

export default router;