import { prisma, Prisma } from "@beaconu/db";

const ROUTE_SELECT = {
  id: true,
  name: true,
  description: true,
} as const;

const STOP_SELECT = {
  id: true,
  stopName: true,
  landmark: true,
  morningTime: true,
  eveningTime: true,
  stopOrder: true,
} as const;

const BUS_SELECT = {
  id: true,
  busNumber: true,
  busName: true,
  busType: true,
  busModel: true,
  totalSeats: true,
  availableSeats: true,
  driverName: true,
  driverPhone: true,
  driverStatus: true,
  monthlyFee: true,
} as const;

const ENROLLMENT_SELECT = {
  id: true,
  status: true,
  enrolledFrom: true,
  enrolledUntil: true,
  route: { select: { id: true, name: true } },
  bus: {
    select: {
      id: true,
      busNumber: true,
      busName: true,
      monthlyFee: true,
      driverName: true,
      driverPhone: true,
      driverStatus: true,
    },
  },
  pickupStop: {
    select: {
      id: true,
      stopName: true,
      morningTime: true,
      eveningTime: true,
    },
  },
} as const;

export class CommuteRepository {
  static async listActiveRoutesForCollege(collegeId: string) {
    return prisma.commuteRoute.findMany({
      where: { collegeId, isActive: true },
      select: ROUTE_SELECT,
      orderBy: { name: "asc" },
    });
  }

  static async findRouteForCollege(routeId: string, collegeId: string) {
    return prisma.commuteRoute.findFirst({
      where: { id: routeId, collegeId, isActive: true },
      select: { id: true },
    });
  }

  static async listPickupStopsForRoute(routeId: string) {
    return prisma.commuteRouteStop.findMany({
      where: { routeId, isPickupPoint: true },
      select: STOP_SELECT,
      orderBy: { stopOrder: "asc" },
    });
  }

  static async listAllStopsForRoute(routeId: string) {
    return prisma.commuteRouteStop.findMany({
      where: { routeId },
      select: STOP_SELECT,
      orderBy: { stopOrder: "asc" },
    });
  }

  static async listActiveBusesForRoute(routeId: string) {
    return prisma.commuteBus.findMany({
      where: { routeId, isActive: true },
      select: BUS_SELECT,
      orderBy: { busNumber: "asc" },
    });
  }

  static async findBusForRoute(busId: string, routeId: string) {
    return prisma.commuteBus.findFirst({
      where: { id: busId, routeId, isActive: true },
      select: { id: true, availableSeats: true, totalSeats: true },
    });
  }

  static async findStopForRoute(stopId: string, routeId: string) {
    return prisma.commuteRouteStop.findFirst({
      where: { id: stopId, routeId },
      select: { id: true },
    });
  }

  static async findActiveEnrollment(studentId: string) {
    return prisma.commuteEnrollment.findFirst({
      where: { studentId, status: "active" },
      select: ENROLLMENT_SELECT,
    });
  }

  static async findEnrollmentById(id: string) {
    return prisma.commuteEnrollment.findUnique({
      where: { id },
      select: ENROLLMENT_SELECT,
    });
  }

  static async createEnrollment(
    tx: Prisma.TransactionClient,
    data: {
      studentId: string;
      collegeId: string;
      routeId: string;
      busId: string;
      pickupStopId: string;
    },
  ) {
    return tx.commuteEnrollment.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        routeId: data.routeId,
        busId: data.busId,
        pickupStopId: data.pickupStopId,
        status: "active",
        enrolledFrom: new Date(),
      },
      select: { id: true },
    });
  }

  static async closeEnrollment(tx: Prisma.TransactionClient, id: string) {
    return tx.commuteEnrollment.update({
      where: { id },
      data: { status: "inactive", enrolledUntil: new Date() },
      select: { id: true },
    });
  }

  static async decrementBusSeat(tx: Prisma.TransactionClient, busId: string) {
    return tx.commuteBus.updateMany({
      where: { id: busId, availableSeats: { gt: 0 } },
      data: { availableSeats: { decrement: 1 } },
    });
  }

  static async incrementBusSeat(tx: Prisma.TransactionClient, busId: string) {
    const bus = await tx.commuteBus.findUnique({
      where: { id: busId },
      select: { totalSeats: true },
    });
    if (!bus) return { count: 0 };
    return tx.commuteBus.updateMany({
      where: { id: busId, availableSeats: { lt: bus.totalSeats } },
      data: { availableSeats: { increment: 1 } },
    });
  }

  static async listRideHistory(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const [rows, total] = await prisma.$transaction([
      prisma.commuteRideHistory.findMany({
        where: { studentId },
        select: {
          id: true,
          rideDate: true,
          rideType: true,
          boardedAt: true,
          droppedAt: true,
          status: true,
          bus: { select: { busNumber: true } },
        },
        orderBy: { rideDate: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.commuteRideHistory.count({ where: { studentId } }),
    ]);
    return { rows, total };
  }
}
