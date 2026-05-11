import { BlinkRepository } from './blink.repository';
import { CryptoUtils } from '@/shared/utils';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/shared/errors';
import { prisma } from '@beaconu/db';
import { SessionManager } from '../auth/auth.session';
import { JwtUtils } from '../auth/auth.jwt';
import {
  RegisterAssociateAdminData,
  RegisterAssociateEmployeeData,
  RegisterCampusAmbassadorData,
  UpdateAssociateEmployeeStatusData,
  BlinkLoginData,
} from './blink.types';
import { USER_TYPES, ACCOUNT_STATUS } from '@/shared/constants';
import { UserType } from '../auth/auth.types';
import { BLINK_ROLE_PERMISSIONS, BLINK_ROLES } from './blink.permissions';

function getBlinkUserType(roleSlug: string): UserType {
  switch (roleSlug) {
    case BLINK_ROLES.ASSOCIATE_ADMIN:
      return USER_TYPES.BLINK_ASSOCIATE as UserType;
    case BLINK_ROLES.ASSOCIATE_EMPLOYEE:
      return USER_TYPES.BLINK_EMPLOYEE as UserType;
    case BLINK_ROLES.CAMPUS_AMBASSADOR:
      return USER_TYPES.BLINK_AMBASSADOR as UserType;
    default:
      return USER_TYPES.BLINK_ASSOCIATE as UserType;
  }
}

export class BlinkService {
  static async registerAssociateAdmin(data: RegisterAssociateAdminData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError('Email already exists');

    const existingReg = await BlinkRepository.findByRegNumber(data.agency_reg_number);
    if (existingReg) throw new ConflictError('Agency registration number already exists');

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.ASSOCIATE_ADMIN },
    });
    if (!role) throw new NotFoundError('Blink role not found');

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      country: data.country,
      agencyName: data.agency_name,
      agencyRegNumber: data.agency_reg_number,
      roleId: role.id,
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
    });

    const userType = USER_TYPES.BLINK_ASSOCIATE as UserType;
    const session = await SessionManager.createSession({ userId: user.id, userType });
    const permissions = BLINK_ROLE_PERMISSIONS[user.blinkRole.slug] ?? [];

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType,
      roleId: user.blinkRoleId,
      permissions,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        agencyName: user.agencyName,
        status: user.status,
        roleSlug: user.blinkRole.slug,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
      message: 'Registration submitted. Your account is pending approval by super admin.',
    };
  }

  static async registerAssociateEmployee(data: RegisterAssociateEmployeeData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError('Email already exists');

    // Validate the parent exists and is an associate_admin
    const parentUser = await BlinkRepository.findById(data.associate_parent_id);
    if (!parentUser) throw new NotFoundError('Associate admin not found');
    if (parentUser.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_ADMIN) {
      throw new ForbiddenError('Parent user must be an associate admin');
    }

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.ASSOCIATE_EMPLOYEE },
    });
    if (!role) throw new NotFoundError('Blink role not found');

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      associateParentId: data.associate_parent_id,
      roleId: role.id,
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roleSlug: user.blinkRole.slug,
      },
      message: 'Registration submitted. Your account is pending approval by your admin.',
    };
  }

  static async registerCampusAmbassador(data: RegisterCampusAmbassadorData, createdByStaffId: string) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError('Email already exists');

    const staff = await prisma.staffMember.findUnique({
      where: { id: createdByStaffId },
    });

    if (!staff) throw new NotFoundError('Staff member not found');
    if (staff.collegeId !== data.college_id) {
      throw new ForbiddenError('Campus ambassador can only be created for your own college');
    }

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.CAMPUS_AMBASSADOR },
    });
    if (!role) throw new NotFoundError('Blink role not found');

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      collegeId: data.college_id,
      linkedStudentId: data.linked_student_id,
      ambassadorType: data.ambassador_type,
      createdByStaffId,
      roleId: role.id,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      collegeId: user.collegeId,
      ambassadorType: user.ambassadorType,
      roleSlug: user.blinkRole.slug,
      status: user.status,
    };
  }

  static async listAssociateEmployees(associateAdminId: string) {
    const employees = await BlinkRepository.findEmployeesByParent(associateAdminId);
    return employees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      status: employee.status,
      roleSlug: employee.blinkRole.slug,
      createdAt: employee.createdAt,
    }));
  }

  static async updateAssociateEmployeeStatus(
    associateAdminId: string,
    employeeId: string,
    data: UpdateAssociateEmployeeStatusData
  ) {
    const employee = await BlinkRepository.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    if (employee.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_EMPLOYEE) {
      throw new ForbiddenError('Target user is not an associate employee');
    }

    if (employee.associateParentId !== associateAdminId) {
      throw new ForbiddenError('You can only update your own employees');
    }

    const updated = await BlinkRepository.updateStatus(employeeId, data.status);

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      status: updated.status,
      roleSlug: updated.blinkRole.slug,
    };
  }

  static async login(data: BlinkLoginData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await BlinkRepository.findByEmail(normalizedEmail);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isMatch = await CryptoUtils.compare(data.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${user.status}`);
    }

    await BlinkRepository.updateLastLogin(user.id);

    const userType = getBlinkUserType(user.blinkRole.slug);
    const session = await SessionManager.createSession({ userId: user.id, userType });
    const permissions = BLINK_ROLE_PERMISSIONS[user.blinkRole.slug] ?? [];

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType,
      roleId: user.blinkRoleId,
      permissions,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        agencyName: user.agencyName,
        roleSlug: user.blinkRole.slug,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async getProfile(userId: string) {
    const user = await BlinkRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

