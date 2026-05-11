import { Router } from 'express';
import { PlatformUsersController } from './users/platform-users.controller';
import { PlatformRolesController } from './roles/platform-roles.controller';
import { authorizePlatformSuperAdmin } from './roles/platform-roles.middleware';
import { authenticate } from '@/shared/middleware/authenticate';
import { authorizeUserType } from '@/shared/middleware/authorize';

const router: Router = Router();

// Users domain
router.get(
  '/profiles',
  authenticate,
  authorizeUserType('platform_admin'),
  PlatformUsersController.getAllProfiles,
);

// Roles domain
router.get('/roles/permissions', authenticate, authorizeUserType('platform_admin'), PlatformRolesController.listPermissions);
router.get('/roles', authenticate, authorizeUserType('platform_admin'), PlatformRolesController.listRoles);
router.post(
	'/roles',
	authenticate,
	authorizeUserType('platform_admin'),
	authorizePlatformSuperAdmin,
	PlatformRolesController.createRole,
);
router.put(
	'/roles/:roleId/permissions',
	authenticate,
	authorizeUserType('platform_admin'),
	authorizePlatformSuperAdmin,
	PlatformRolesController.updateRolePermissions,
);

export default router;
