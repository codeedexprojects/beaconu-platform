import { Router } from 'express';
import blinkRoutes from './blink';

const router: Router = Router();

router.use('/blink', blinkRoutes);

// Placeholder for other modules as they get refactored
// router.use('/student', studentRoutes);
// router.use('/platform-admin', platformAdminRoutes);
// router.use('/college-admin', collegeAdminRoutes);
// router.use('/counsellor', counsellorRoutes);
// router.use('/public', publicRoutes);
// router.use('/webhooks', webhookRoutes);

export default router;
