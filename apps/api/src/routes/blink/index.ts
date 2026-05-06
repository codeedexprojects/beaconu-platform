import { Router } from 'express';
import { BlinkController } from '@/modules/blink/blink.controller';
import { authenticate } from '@/modules/auth/auth.middleware';

const router: Router = Router();

// Public routes
router.post('/auth/register', BlinkController.register);
router.post('/auth/login', BlinkController.login);
router.post('/auth/refresh-token', BlinkController.refreshToken);
router.post('/auth/logout', BlinkController.logout);

// Protected routes
router.get('/profile', authenticate, BlinkController.getProfile);

export default router;
