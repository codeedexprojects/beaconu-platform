import { Router } from 'express';
import { AssociateAdminController } from '@/modules/blink/associate-admin/associate-admin.controller';
import associateAdminRoutes from './associate-admin/associate-admin.routes';
import { CampusAmbassadorsController } from '@/modules/blink/campus-ambassadors/campus-ambassadors.controller';
import campusAmbassadorsRoutes from './campus-ambassadors/campus-ambassadors.routes';
import counsellorsRoutes from './counsellors/counsellors.routes';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';
import { BlinkAuthController } from '@/modules/auth/controllers/blink-auth.controller';

const router: Router = Router();

// New grouped route structure under blink
router.use('/associate-admin', associateAdminRoutes);
router.use('/campus-ambassadors', campusAmbassadorsRoutes);
router.use('/counsellors', counsellorsRoutes);

// Blink-level session endpoints
router.post('/auth/refresh-token', BlinkAuthController.refresh);
router.post('/auth/logout', BlinkAuthController.logout);

// Legacy endpoints preserved for backward compatibility
router.post('/auth/register/associate-admin', AssociateAdminController.register);
router.post('/auth/register/associate-employee', AssociateAdminController.registerEmployee);
router.post('/auth/login', AssociateAdminController.login);
router.get('/profile', authenticate, AssociateAdminController.getMe);
router.post('/users/campus-ambassador', authenticate, authorizeUserType('staff_member'), CampusAmbassadorsController.register);
router.get('/employees', authenticate, authorizeUserType('blink_associate'), AssociateAdminController.listEmployees);
router.patch('/employees/:employeeId/status', authenticate, authorizeUserType('blink_associate'), AssociateAdminController.updateEmployeeStatus);

export default router;