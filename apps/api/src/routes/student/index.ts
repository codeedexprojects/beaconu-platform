import { Router } from 'express';

import studentAuthRoutes from '@/modules/auth/routes/student-auth.routes';

const router: Router = Router();

router.use('/auth', studentAuthRoutes);

export default router;
