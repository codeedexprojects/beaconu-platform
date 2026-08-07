import { prisma, Prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { HostelEnrollmentRepository } from "../repositories/hostel-enrollment.repository";
import type { InitiateHostelTokenFeeInput } from "@beaconu/types";

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapEnrollment(
  row: NonNullable<
    Awaited<ReturnType<typeof HostelEnrollmentRepository.findEnrollmentById>>
  >,
) {
  return {
    id: row.id,
    status: row.status,
    roomPlanType: row.roomPlanType,
    enrolledFrom: toDateString(row.enrolledFrom),
    enrolledUntil: row.enrolledUntil ? toDateString(row.enrolledUntil) : null,
    hostel: row.hostel,
    roomType: {
      id: row.roomType.id,
      name: row.roomType.name,
      monthlyPlanPrice: row.roomType.monthlyPlanPrice
        ? row.roomType.monthlyPlanPrice.toString()
        : null,
      annualPlanPrice: row.roomType.annualPlanPrice
        ? row.roomType.annualPlanPrice.toString()
        : null,
    },
    messPlan: row.messPlan,
    dietaryPreference: row.dietaryPreference,
    selectedAddons: Array.isArray(row.selectedAddons) ? row.selectedAddons : [],
    feeBreakdown:
      row.feeBreakdown && typeof row.feeBreakdown === "object"
        ? (row.feeBreakdown as Record<string, unknown>)
        : {},
  };
}

export class HostelEnrollmentService {
  static async isEnrolled(studentId: string): Promise<boolean> {
    const enrollment =
      await HostelEnrollmentRepository.findActiveEnrollment(studentId);
    return enrollment !== null;
  }

  static async validateRoomTypeAccess(studentId: string, roomTypeId: string) {
    const roomType =
      await HostelEnrollmentRepository.findRoomTypeWithHostel(roomTypeId);
    if (!roomType) throw new NotFoundError("Room type not found");

    const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
      studentId,
      roomType.hostel.collegeId,
    );
    if (!hasEnrollment) {
      throw new ForbiddenError("You are not enrolled at this college");
    }
    return roomType;
  }

  static async assertNoActiveEnrollment(studentId: string) {
    const existing =
      await HostelEnrollmentRepository.findActiveEnrollment(studentId);
    if (existing) {
      throw new ConflictError("You already have an active hostel enrollment");
    }
  }

  static async createEnrollment(
    studentId: string,
    roomTypeId: string,
    data: InitiateHostelTokenFeeInput,
  ) {
    const roomType = await this.validateRoomTypeAccess(studentId, roomTypeId);
    await this.assertNoActiveEnrollment(studentId);

    let messPlan: Awaited<
      ReturnType<typeof HostelEnrollmentRepository.findMessPlanForHostel>
    > = null;
    if (data.mess_plan_id) {
      messPlan = await HostelEnrollmentRepository.findMessPlanForHostel(
        data.mess_plan_id,
        roomType.hostel.id,
      );
      if (!messPlan) {
        throw new NotFoundError("Mess plan not found for this hostel");
      }
    }

    const roomPrice =
      data.room_plan_type === "annual"
        ? roomType.annualPlanPrice
        : roomType.monthlyPlanPrice;

    const feeBreakdown = {
      admissionFee: roomType.admissionFee.toString(),
      securityDeposit: roomType.securityDeposit.toString(),
      roomPlanType: data.room_plan_type,
      roomPrice: roomPrice ? roomPrice.toString() : null,
      messPlan: messPlan
        ? {
            id: messPlan.id,
            name: messPlan.name,
            priceMonthly: messPlan.priceMonthly.toString(),
          }
        : null,
      selectedAddons: data.selected_addons ?? [],
    } as unknown as Prisma.InputJsonValue;

    const created = await prisma.$transaction(async (tx) => {
      const decremented = await HostelEnrollmentRepository.decrementBed(
        tx,
        roomTypeId,
      );
      if (decremented.count === 0) {
        throw new ConflictError("No beds available in this room type");
      }
      return HostelEnrollmentRepository.createEnrollment(tx, {
        studentId,
        collegeId: roomType.hostel.collegeId,
        hostelId: roomType.hostel.id,
        roomTypeId,
        roomPlanType: data.room_plan_type,
        messId: data.mess_plan_id ?? null,
        dietaryPreference: data.dietary_preference ?? null,
        selectedAddons: (data.selected_addons ?? []) as unknown as object[],
        feeBreakdown,
      });
    });

    const row = await HostelEnrollmentRepository.findEnrollmentById(created.id);
    return mapEnrollment(row!);
  }

  static async getMyEnrollment(studentId: string) {
    const existing =
      await HostelEnrollmentRepository.findActiveEnrollment(studentId);
    if (!existing) return null;
    const row = await HostelEnrollmentRepository.findEnrollmentById(
      existing.id,
    );
    return mapEnrollment(row!);
  }
}
