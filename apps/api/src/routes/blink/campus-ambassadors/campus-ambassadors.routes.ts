import { Router } from 'express';
import { CampusAmbassadorsController } from '@/modules/blink/campus-ambassadors/campus-ambassadors.controller';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';

const router: Router = Router();

router.post('/', authenticate, authorizeUserType('staff_member'), CampusAmbassadorsController.register);

export default router;