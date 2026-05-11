import { Router } from 'express';

import counsellorAuthRoutes from '@/modules/auth/routes/counsellor-auth.routes';
import counsellorRoutes from '@/modules/counselling/routes/counsellor.routes';

const router: Router = Router();

router.use('/auth', counsellorAuthRoutes);
router.use('/', counsellorRoutes);

export default router;
