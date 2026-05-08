import { Router } from 'express';
import { CounsellorsAuthController } from './counsellors-auth.controller';

const router: Router = Router();

router.post('/register', CounsellorsAuthController.register);
router.post('/login', CounsellorsAuthController.login);

export default router;
