import { Router } from 'express';
import { PlatformAuthController } from './auth/platform-auth.controller';
import { PlatformUsersController } from './users/platform-users.controller';
import { PlatformRolesController } from './roles/platform-roles.controller';
import { authorizePlatformSuperAdmin } from './roles/platform-roles.middleware';
import { authenticate, authorize } from '../auth/auth.middleware';

const router: Router = Router();
// Auth domain
router.post('/auth/login', PlatformAuthController.login);

// Users domain
router.get('/profiles', authenticate, authorize('platform_admin'), PlatformUsersController.getAllProfiles);

// Roles domain
router.get('/roles/permissions', authenticate, authorize('platform_admin'), PlatformRolesController.listPermissions);
router.get('/roles', authenticate, authorize('platform_admin'), PlatformRolesController.listRoles);
router.post(
	'/roles',
	authenticate,
	authorize('platform_admin'),
	authorizePlatformSuperAdmin,
	PlatformRolesController.createRole,
);
router.put(
	'/roles/:roleId/permissions',
	authenticate,
	authorize('platform_admin'),
	authorizePlatformSuperAdmin,
	PlatformRolesController.updateRolePermissions,
);

export default router;
