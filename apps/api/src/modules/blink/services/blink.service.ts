import { prisma } from "@beaconu/db";
import { CryptoUtils } from "@/shared/utils";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { ACCOUNT_STATUS, AccountStatus } from "@/shared/constants";
import { BLINK_ROLES } from "../blink.permissions";
import { BlinkRepository } from "../repositories/blink.repository";
import {
  RegisterAssociateEmployeeInput,
  RegisterAmbassadorInput,
  UpdateEmployeeStatusInput,
} from "../validators/blink.validator";

export class BlinkService {
  static async registerAssociateEmployee(data: RegisterAssociateEmployeeInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    const parentUser = await BlinkRepository.findById(data.associate_parent_id);
    if (!parentUser) throw new NotFoundError("Associate admin not found");
    if (parentUser.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_ADMIN) {
      throw new ForbiddenError("Parent user must be an associate admin");
    }

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.ASSOCIATE_EMPLOYEE },
    });
    if (!role) throw new NotFoundError("Blink role not found");

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      associateParentId: data.associate_parent_id,
      roleId: role.id,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roleSlug: user.blinkRole.slug,
      },
      message:
        "Registration submitted. Your account is pending approval by your admin.",
    };
  }

  static async registerAmbassador(
    data: RegisterAmbassadorInput,
    createdByStaffId: string,
  ) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    const staff = await prisma.staffMember.findUnique({
      where: { id: createdByStaffId },
    });
    if (!staff) throw new NotFoundError("Staff member not found");
    if (staff.collegeId !== data.college_id) {
      throw new ForbiddenError(
        "Campus ambassador can only be created for your own college",
      );
    }

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.CAMPUS_AMBASSADOR },
    });
    if (!role) throw new NotFoundError("Blink role not found");

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
    const employees =
      await BlinkRepository.findEmployeesByParent(associateAdminId);
    return employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      status: e.status,
      roleSlug: e.blinkRole.slug,
      createdAt: e.createdAt,
    }));
  }

  static async listPendingEmployees(associateAdminId: string) {
    const employees = await BlinkRepository.findEmployeesByParent(
      associateAdminId,
      ACCOUNT_STATUS.PENDING_APPROVAL,
    );
    return employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      status: e.status,
      roleSlug: e.blinkRole.slug,
      createdAt: e.createdAt,
    }));
  }

  static async updateAssociateEmployeeStatus(
    associateAdminId: string,
    employeeId: string,
    data: UpdateEmployeeStatusInput,
  ) {
    const employee = await BlinkRepository.findById(employeeId);
    if (!employee) throw new NotFoundError("Employee not found");
    if (employee.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_EMPLOYEE) {
      throw new ForbiddenError("Target user is not an associate employee");
    }
    if (employee.associateParentId !== associateAdminId) {
      throw new ForbiddenError("You can only update your own employees");
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

  static async getProfile(userId: string) {
    const user = await BlinkRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      agencyName: user.agencyName,
      collegeId: user.collegeId,
      roleSlug: user.blinkRole.slug,
      status: user.status,
    };
  }

  static async updateBlinkUserStatus(id: string, status: AccountStatus) {
    const user = await BlinkRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    return await BlinkRepository.updateStatus(id, status);
  }
}
