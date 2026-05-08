import { Router } from 'express';
import { CampusAmbassadorsController } from '@/modules/blink/campus-ambassadors/campus-ambassadors.controller';
import { authenticate, authorize } from '@/modules/auth/auth.middleware';

const router: Router = Router();

router.post('/', authenticate, authorize('staff_member'), CampusAmbassadorsController.register);

export default router;