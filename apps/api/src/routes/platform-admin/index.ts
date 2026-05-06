import { Router } from 'express';
import { PlatformAdminController } from '@/modules/platform-admin/platform-admin.controller';

import { authenticate, authorize } from '@/modules/auth/auth.middleware';

const router: Router = Router();

// Auth
router.post('/auth/login', PlatformAdminController.login);

// Profiles (Super-admin only)
router.get('/profiles', authenticate, authorize('platform_admin'), PlatformAdminController.getAllProfiles);

export default router;
