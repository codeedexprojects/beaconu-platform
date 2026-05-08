import { Router } from 'express';
import { CounsellorController } from '@/modules/blink/counsellors/counsellors.controller';
import { authenticate, authorize } from '@/modules/auth/auth.middleware';
import counsellorsAuthRoutes from '@/modules/blink/counsellors/auth/counsellors-auth.routes';

const router: Router = Router();

// Counsellor auth
router.use('/auth', counsellorsAuthRoutes);

// Counsellor self-service (authenticated as counsellor)
router.get('/me', authenticate, authorize('counsellor'), CounsellorController.getMe);
router.patch('/me', authenticate, authorize('counsellor'), CounsellorController.updateMe);

// Platform admin management
router.get('/', authenticate, authorize('platform_admin'), CounsellorController.listAll);
router.get('/:id', authenticate, authorize('platform_admin'), CounsellorController.getById);
router.patch('/:id/status', authenticate, authorize('platform_admin'), CounsellorController.updateStatus);

export default router;