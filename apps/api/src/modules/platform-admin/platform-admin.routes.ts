import { Router } from 'express';
import { PlatformAuthController } from './auth/platform-auth.controller';
import { PlatformUsersController } from './users/platform-users.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Auth domain
router.post('/auth/login', PlatformAuthController.login);

// Users domain
router.get(
  '/profiles',
  authenticate,
  authorize('platform_admin'),
  PlatformUsersController.getAllProfiles,
);

export default router;
