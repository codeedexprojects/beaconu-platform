import { Router } from 'express';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import { updateMyProfileSchema } from '../validators/counselling.validator';
import { CounsellorController } from '../controllers/counsellor.controller';

const router: Router = Router();

router.get('/profile', authenticate, authorizeUserType('counsellor'), CounsellorController.getProfile);
router.patch('/profile', authenticate, authorizeUserType('counsellor'), validate(updateMyProfileSchema), CounsellorController.updateProfile);

export default router;
