import { Router } from 'express';
import { UnifiedAuthController } from './auth-unified.controller';

const router: Router = Router();

// Auth endpoints
router.post('/login', UnifiedAuthController.login);
router.post('/login/counsellor', UnifiedAuthController.loginCounsellor);
router.post('/counsellor/login', UnifiedAuthController.loginCounsellor);

// Session endpoints
router.post('/refresh-token', UnifiedAuthController.refresh);
router.post('/logout', UnifiedAuthController.logout);

export default router;
