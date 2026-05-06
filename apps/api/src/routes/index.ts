import { Router } from 'express';
import blinkRoutes from './blink';
import platformAdminRoutes from './platform-admin';

const router: Router = Router();

router.use('/blink', blinkRoutes);
router.use('/platform-admin', platformAdminRoutes);
// router.use('/college-admin', collegeAdminRoutes);
// router.use('/counsellor', counsellorRoutes);
// router.use('/public', publicRoutes);
// router.use('/webhooks', webhookRoutes);

export default router;
