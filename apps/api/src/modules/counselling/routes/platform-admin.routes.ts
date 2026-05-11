import { Router } from 'express';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import { updateCounsellorStatusSchema } from '../validators/counselling.validator';
import { CounsellingPlatformAdminController } from '../controllers/platform-admin.controller';

const router: Router = Router();

router.get('/', authenticate, authorizeUserType('platform_admin'), CounsellingPlatformAdminController.listAll);
router.get('/:id', authenticate, authorizeUserType('platform_admin'), CounsellingPlatformAdminController.getById);
router.patch(
  '/:id/status',
  authenticate,
  authorizeUserType('platform_admin'),
  validate(updateCounsellorStatusSchema),
  CounsellingPlatformAdminController.updateStatus,
);

export default router;
