import { Router } from 'express';

// Auth routes — one per actor
import blinkAuthRoutes from '@/modules/auth/routes/blink-auth.routes';
import counsellorAuthRoutes from '@/modules/auth/routes/counsellor-auth.routes';
import platformAuthRoutes from '@/modules/auth/routes/platform-auth.routes';
import studentAuthRoutes from '@/modules/auth/routes/student-auth.routes';
import staffAuthRoutes from '@/modules/auth/routes/staff-auth.routes';

// Legacy routes — to be migrated module by module
import blinkRoutes from './blink';
import platformAdminRoutes from './platform-admin';

const router: Router = Router();

// === Auth ===
router.use('/api/v1/blink/auth', blinkAuthRoutes);
router.use('/api/v1/counsellor/auth', counsellorAuthRoutes);
router.use('/api/v1/admin/auth', platformAuthRoutes);
router.use('/api/v1/student/auth', studentAuthRoutes);
router.use('/api/v1/college/auth', staffAuthRoutes);

// === Legacy (pre-refactor) — remove as each module is migrated ===
router.use('/blink', blinkRoutes);
router.use('/platform-admin', platformAdminRoutes);

export default router;
