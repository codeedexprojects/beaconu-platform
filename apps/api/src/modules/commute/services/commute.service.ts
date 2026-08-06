import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { CommuteRepository } from "../repositories/commute.repository";
import { CommutePaymentService } from "@/modules/payments/services/commute-payment.service";
import type { SetupCommuteInput } from "@beaconu/types";

function toTimeString(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(11, 16);
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapRoute(row: {
  id: string;
  name: string;
  description: string | null;
}) {
  return row;
}

function mapStop(row: {
  id: string;
  stopName: string;
  landmark: string | null;
  morningTime: Date | null;
  eveningTime: Date | null;
  stopOrder: number;
}) {
  return {
    id: row.id,
    stopName: row.stopName,
    landmark: row.landmark,
    morningTime: toTimeString(row.morningTime),
    eveningTime: toTimeString(row.eveningTime),
    stopOrder: row.stopOrder,
  };
}

function mapBus(row: {
  id: string;
  busNumber: string;
  busName: string | null;
  busType: string | null;
  busModel: string | null;
  totalSeats: number;
  availableSeats: number;
  driverName: string | null;
  driverPhone: string | null;
  driverStatus: string;
  monthlyFee: { toString(): string };
}) {
  return {
    ...row,
    monthlyFee: row.monthlyFee.toString(),
  };
}

function mapEnrollment(
  row: NonNullable<
    Awaited<ReturnType<typeof CommuteRepository.findActiveEnrollment>>
  >,
) {
  return {
    id: row.id,
    status: row.status,
    enrolledFrom: toDateString(row.enrolledFrom),
    enrolledUntil: row.enrolledUntil ? toDateString(row.enrolledUntil) : null,
    route: row.route,
    bus: {
      ...row.bus,
      monthlyFee: row.bus.monthlyFee.toString(),
    },
    pickupStop: {
      id: row.pickupStop.id,
      stopName: row.pickupStop.stopName,
      morningTime: toTimeString(row.pickupStop.morningTime),
      eveningTime: toTimeString(row.pickupStop.eveningTime),
    },
  };
}

async function assertEnrolled(studentId: string, collegeId: string) {
  const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
    studentId,
    collegeId,
  );
  if (!hasEnrollment) {
    throw new ForbiddenError("You are not enrolled at this college");
  }
}

export class CommuteService {
  static async listRoutes(studentId: string, collegeId: string) {
    await assertEnrolled(studentId, collegeId);
    const rows = await CommuteRepository.listActiveRoutesForCollege(collegeId);
    return rows.map(mapRoute);
  }

  static async listStops(
    studentId: string,
    collegeId: string,
    routeId: string,
  ) {
    await assertEnrolled(studentId, collegeId);
    const route = await CommuteRepository.findRouteForCollege(
      routeId,
      collegeId,
    );
    if (!route) throw new NotFoundError("Commute route not found");
    const rows = await CommuteRepository.listPickupStopsForRoute(routeId);
    return rows.map(mapStop);
  }

  static async listBuses(
    studentId: string,
    collegeId: string,
    routeId: string,
  ) {
    await assertEnrolled(studentId, collegeId);
    const route = await CommuteRepository.findRouteForCollege(
      routeId,
      collegeId,
    );
    if (!route) throw new NotFoundError("Commute route not found");
    const rows = await CommuteRepository.listActiveBusesForRoute(routeId);
    return rows.map(mapBus);
  }

  private static async validateSelection(
    collegeId: string,
    data: SetupCommuteInput,
  ) {
    const route = await CommuteRepository.findRouteForCollege(
      data.route_id,
      collegeId,
    );
    if (!route) throw new NotFoundError("Commute route not found");

    const bus = await CommuteRepository.findBusForRoute(
      data.bus_id,
      data.route_id,
    );
    if (!bus) throw new NotFoundError("Bus not found on this route");
    if (bus.availableSeats <= 0) {
      throw new ConflictError("This bus has no seats available");
    }

    const stop = await CommuteRepository.findStopForRoute(
      data.pickup_stop_id,
      data.route_id,
    );
    if (!stop) throw new NotFoundError("Pickup point not found on this route");
  }

  static async setup(studentId: string, data: SetupCommuteInput) {
    await assertEnrolled(studentId, data.college_id);

    const existing = await CommuteRepository.findActiveEnrollment(studentId);
    if (existing) {
      throw new ConflictError(
        "You already have an active commute enrollment — use Modify Commute instead",
      );
    }

    await this.validateSelection(data.college_id, data);

    const created = await prisma.$transaction(async (tx) => {
      const decremented = await CommuteRepository.decrementBusSeat(
        tx,
        data.bus_id,
      );
      if (decremented.count === 0) {
        throw new ConflictError("This bus has no seats available");
      }
      return CommuteRepository.createEnrollment(tx, {
        studentId,
        collegeId: data.college_id,
        routeId: data.route_id,
        busId: data.bus_id,
        pickupStopId: data.pickup_stop_id,
      });
    });

    const row = await CommuteRepository.findEnrollmentById(created.id);
    return mapEnrollment(row!);
  }

  static async modify(studentId: string, data: SetupCommuteInput) {
    await assertEnrolled(studentId, data.college_id);

    const existing = await CommuteRepository.findActiveEnrollment(studentId);
    if (!existing) {
      throw new NotFoundError(
        "No active commute enrollment to modify — use Setup Commute instead",
      );
    }

    await this.validateSelection(data.college_id, data);

    const created = await prisma.$transaction(async (tx) => {
      const decremented = await CommuteRepository.decrementBusSeat(
        tx,
        data.bus_id,
      );
      if (decremented.count === 0) {
        throw new ConflictError("This bus has no seats available");
      }
      await CommuteRepository.closeEnrollment(tx, existing.id);
      await CommuteRepository.incrementBusSeat(tx, existing.bus.id);
      return CommuteRepository.createEnrollment(tx, {
        studentId,
        collegeId: data.college_id,
        routeId: data.route_id,
        busId: data.bus_id,
        pickupStopId: data.pickup_stop_id,
      });
    });

    const row = await CommuteRepository.findEnrollmentById(created.id);
    return mapEnrollment(row!);
  }

  static async getDashboard(studentId: string, collegeId: string) {
    await assertEnrolled(studentId, collegeId);
    const row = await CommuteRepository.findActiveEnrollment(studentId);
    const enrollment = row ? mapEnrollment(row) : null;
    const paymentDue = enrollment
      ? await CommutePaymentService.getCurrentPeriodStatus(
          studentId,
          collegeId,
          enrollment.bus.monthlyFee,
        )
      : null;
    return { enrollment, paymentDue };
  }

  static async getRouteSchedule(
    studentId: string,
    collegeId: string,
    routeId: string,
    period: "morning" | "evening",
  ) {
    await assertEnrolled(studentId, collegeId);
    const route = await CommuteRepository.findRouteForCollege(
      routeId,
      collegeId,
    );
    if (!route) throw new NotFoundError("Commute route not found");

    const [stops, activeEnrollment] = await Promise.all([
      CommuteRepository.listAllStopsForRoute(routeId),
      CommuteRepository.findActiveEnrollment(studentId),
    ]);

    const myPickupStopId =
      activeEnrollment && activeEnrollment.route.id === routeId
        ? activeEnrollment.pickupStop.id
        : null;

    return stops.map((s) => ({
      id: s.id,
      stopName: s.stopName,
      landmark: s.landmark,
      time: toTimeString(period === "morning" ? s.morningTime : s.eveningTime),
      stopOrder: s.stopOrder,
      isMyPickup: s.id === myPickupStopId,
    }));
  }

  static async listRideHistory(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await CommuteRepository.listRideHistory(
      studentId,
      pagination,
    );
    return {
      data: rows.map((r) => ({
        id: r.id,
        rideDate: toDateString(r.rideDate),
        rideType: r.rideType as "morning" | "evening",
        boardedAt: r.boardedAt ? r.boardedAt.toISOString() : null,
        droppedAt: r.droppedAt ? r.droppedAt.toISOString() : null,
        status: r.status,
        busNumber: r.bus.busNumber,
      })),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }
}
