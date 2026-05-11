import { Router } from 'express';
import { validate } from '@/shared/middleware/validate';
import { platformLoginSchema } from '../validators/auth.validator';
import { PlatformAuthController } from '../controllers/platform-auth.controller';

const router: Router = Router();

router.post('/login', validate(platformLoginSchema), PlatformAuthController.login);
router.post('/refresh-token', PlatformAuthController.refresh);
router.post('/logout', PlatformAuthController.logout);

export default router;
