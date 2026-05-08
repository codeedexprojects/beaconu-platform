import { Router } from 'express';
import blinkRoutes from './blink';
import platformAdminRoutes from './platform-admin';
import authRoutes from '@/modules/auth/auth.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/blink', blinkRoutes);
router.use('/platform-admin', platformAdminRoutes);
// router.use('/college-admin', collegeAdminRoutes);
// router.use('/public', publicRoutes);
// router.use('/webhooks', webhookRoutes);

export default router;
