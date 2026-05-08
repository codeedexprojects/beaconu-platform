import { Request, Response, NextFunction } from 'express';
import { prisma } from '@beaconu/db';
import { ForbiddenError } from '@/shared/errors';

export async function authorizePlatformSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.userType !== 'platform_admin') {
      return next(new ForbiddenError('Only platform admins can perform this action'));
    }

    if (req.permissions?.includes('*')) {
      next();
      return;
    }

    if (!req.roleId) {
      return next(new ForbiddenError('Role is required to perform this action'));
    }

    const role = await prisma.platformRole.findUnique({
      where: { id: req.roleId },
      select: { slug: true },
    });

    if (!role || role.slug !== 'super_admin') {
      return next(new ForbiddenError('Only super_admin can perform this action'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
