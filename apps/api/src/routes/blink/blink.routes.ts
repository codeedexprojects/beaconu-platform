import { Router } from 'express';
import { AssociateAdminController } from '@/modules/blink/associate-admin/associate-admin.controller';
import associateAdminRoutes from './associate-admin/associate-admin.routes';
import { CampusAmbassadorsController } from '@/modules/blink/campus-ambassadors/campus-ambassadors.controller';
import campusAmbassadorsRoutes from './campus-ambassadors/campus-ambassadors.routes';
import counsellorsRoutes from './counsellors/counsellors.routes';
import { authenticate, authorize } from '@/modules/auth/auth.middleware';
import { UnifiedAuthController } from '@/modules/auth/auth-unified.controller';

const router: Router = Router();

// New grouped route structure under blink
router.use('/associate-admin', associateAdminRoutes);
router.use('/campus-ambassadors', campusAmbassadorsRoutes);
router.use('/counsellors', counsellorsRoutes);

// Blink-level session endpoints
router.post('/auth/refresh-token', UnifiedAuthController.refresh);
router.post('/auth/logout', UnifiedAuthController.logout);

// Legacy endpoints preserved for backward compatibility
router.post('/auth/register/associate-admin', AssociateAdminController.register);
router.post('/auth/register/associate-employee', AssociateAdminController.registerEmployee);
router.post('/auth/login', AssociateAdminController.login);
router.get('/profile', authenticate, AssociateAdminController.getMe);
router.post('/users/campus-ambassador', authenticate, authorize('staff_member'), CampusAmbassadorsController.register);
router.get('/employees', authenticate, authorize('blink_associate'), AssociateAdminController.listEmployees);
router.patch('/employees/:employeeId/status', authenticate, authorize('blink_associate'), AssociateAdminController.updateEmployeeStatus);

export default router;