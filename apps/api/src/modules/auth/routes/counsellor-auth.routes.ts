import { Router } from 'express';
import { validate } from '@/shared/middleware/validate';
import { loginSchema, registerCounsellorSchema } from '../validators/auth.validator';
import { CounsellorAuthController } from '../controllers/counsellor-auth.controller';

const router: Router = Router();

router.post('/register', validate(registerCounsellorSchema), CounsellorAuthController.register);
router.post('/login', validate(loginSchema), CounsellorAuthController.login);
router.post('/refresh-token', CounsellorAuthController.refresh);
router.post('/logout', CounsellorAuthController.logout);

export default router;
