import { Router } from 'express';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import {
  registerAssociateAdminSchema,
  registerAssociateEmployeeSchema,
  updateEmployeeStatusSchema,
} from '../validators/blink.validator';
import { AssociateAdminController } from '../controllers/associate-admin.controller';

const router: Router = Router();

router.post('/register', validate(registerAssociateAdminSchema), AssociateAdminController.register);
router.post('/employees/register', validate(registerAssociateEmployeeSchema), AssociateAdminController.registerEmployee);

router.get('/profile', authenticate, AssociateAdminController.getProfile);
router.get('/employees', authenticate, authorizeUserType('blink_associate'), AssociateAdminController.listEmployees);
router.patch(
  '/employees/:employeeId/status',
  authenticate,
  authorizeUserType('blink_associate'),
  validate(updateEmployeeStatusSchema),
  AssociateAdminController.updateEmployeeStatus,
);

export default router;
