import { Router } from 'express';
import { AssociateAdminController } from '@/modules/blink/associate-admin/associate-admin.controller';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';

const router: Router = Router();

router.post('/register', AssociateAdminController.register);
router.post('/employees/register', AssociateAdminController.registerEmployee);
router.post('/login', AssociateAdminController.login);
router.post('/refresh-token', AssociateAdminController.refresh);
router.post('/logout', AssociateAdminController.logout);

router.get('/profile', authenticate, AssociateAdminController.getMe);
router.get('/employees', authenticate, authorizeUserType('blink_associate'), AssociateAdminController.listEmployees);
router.patch(
  '/employees/:employeeId/status',
  authenticate,
  authorizeUserType('blink_associate'),
  AssociateAdminController.updateEmployeeStatus,
);

export default router;