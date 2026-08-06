import { prisma, Prisma } from "@beaconu/db";

const ENROLLMENT_SELECT = {
  id: true,
  status: true,
  roomPlanType: true,
  dietaryPreference: true,
  selectedAddons: true,
  feeBreakdown: true,
  enrolledFrom: true,
  enrolledUntil: true,
  hostel: { select: { id: true, name: true } },
  roomType: {
    select: {
      id: true,
      name: true,
      monthlyPlanPrice: true,
      annualPlanPrice: true,
    },
  },
  messPlan: { select: { id: true, name: true } },
} as const;

export class HostelEnrollmentRepository {
  static async findRoomTypeWithHostel(roomTypeId: string) {
    return prisma.hostelRoomType.findUnique({
      where: { id: roomTypeId },
      select: {
        id: true,
        name: true,
        admissionFee: true,
        securityDeposit: true,
        monthlyPlanPrice: true,
        annualPlanPrice: true,
        availableBeds: true,
        hostel: { select: { id: true, name: true, collegeId: true } },
      },
    });
  }

  static async findMessPlanForHostel(messPlanId: string, hostelId: string) {
    return prisma.hostelMessPlan.findFirst({
      where: { id: messPlanId, hostelId },
      select: { id: true, name: true, priceMonthly: true },
    });
  }

  static async findAddonServicesForHostel(hostelId: string) {
    return prisma.hostelAddonService.findMany({
      where: { hostelId, isActive: true },
      select: { id: true, name: true, plans: true },
    });
  }

  static async findActiveEnrollment(studentId: string) {
    return prisma.hostelEnrollment.findFirst({
      where: { studentId, status: "active" },
      select: { id: true },
    });
  }

  static async findEnrollmentById(id: string) {
    return prisma.hostelEnrollment.findUnique({
      where: { id },
      select: ENROLLMENT_SELECT,
    });
  }

  static async decrementBed(tx: Prisma.TransactionClient, roomTypeId: string) {
    return tx.hostelRoomType.updateMany({
      where: { id: roomTypeId, availableBeds: { gt: 0 } },
      data: { availableBeds: { decrement: 1 } },
    });
  }

  static async createEnrollment(
    tx: Prisma.TransactionClient,
    data: {
      studentId: string;
      collegeId: string;
      hostelId: string;
      roomTypeId: string;
      roomPlanType: string;
      messId: string | null;
      dietaryPreference: string | null;
      selectedAddons: Prisma.InputJsonValue;
      feeBreakdown: Prisma.InputJsonValue;
    },
  ) {
    return tx.hostelEnrollment.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        hostelId: data.hostelId,
        roomTypeId: data.roomTypeId,
        roomPlanType: data.roomPlanType,
        messId: data.messId,
        dietaryPreference: data.dietaryPreference,
        selectedAddons: data.selectedAddons,
        feeBreakdown: data.feeBreakdown,
        status: "active",
        enrolledFrom: new Date(),
      },
      select: { id: true },
    });
  }
}
