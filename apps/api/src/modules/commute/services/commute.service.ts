import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { CommuteRepository } from "../repositories/commute.repository";
import { CommutePaymentService } from "@/modules/payments/services/commute-payment.service";
import type {
  PublicCommuteRoute,
  PublicCommuteRule,
  PublicCommuteSection,
  SetupCommuteInput,
} from "@beaconu/types";

function toTimeString(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(11, 16);
}

function toDisplayTime(value: Date | null): string | undefined {
  if (!value) return undefined;
  const hours = value.getUTCHours();
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
}

function earliestTime(times: (Date | null)[]): Date | null {
  const present = times.filter((t): t is Date => t !== null);
  if (present.length === 0) return null;
  return present.reduce((min, t) => (t < min ? t : min));
}

function formatFee(fees: number[]): string | undefined {
  if (fees.length === 0) return undefined;
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (max === 0) return "Free";
  const label = `₹${min.toLocaleString("en-IN")}`;
  return min === max ? label : `From ${label}`;
}

function asConductPolicy(value: unknown): PublicCommuteRule[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is PublicCommuteRule =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as PublicCommuteRule).title === "string",
  );
}

function mapPublicRoute(
  row: Awaited<
    ReturnType<typeof CommuteRepository.listPublicRoutesForCollege>
  >[number],
): PublicCommuteRoute {
  const pickupStops = row.stops.filter((s) => s.isPickupPoint);
  const morning = earliestTime(pickupStops.map((s) => s.morningTime));
  const evening = earliestTime(pickupStops.map((s) => s.eveningTime));
  const firstBus = row.buses[0];

  return {
    route_name: row.name,
    via: row.description ?? undefined,
    pickup_point: pickupStops[0]?.stopName,
    status: row.isVerified ? "VERIFIED" : "UNVERIFIED",
    timings: [
      ...(morning ? [{ label: "Morning", time: toDisplayTime(morning) }] : []),
      ...(evening ? [{ label: "Evening", time: toDisplayTime(evening) }] : []),
    ],
    transport_fee: {
      amount: formatFee(row.buses.map((b) => b.monthlyFee.toNumber())),
      payment_structure: row.buses.length > 0 ? "month" : undefined,
    },
    bus_information: firstBus
      ? {
          registration_number: firstBus.busNumber,
          seats: firstBus.totalSeats,
          model: firstBus.busModel ?? undefined,
        }
      : undefined,
    morning_pickup_points: pickupStops
      .filter((s) => s.morningTime)
      .map((s) => ({
        point: s.stopName,
        landmark: s.landmark ?? undefined,
        time: toDisplayTime(s.morningTime),
      })),
    evening_dropoff_points: [...pickupStops]
      .reverse()
      .filter((s) => s.eveningTime)
      .map((s) => ({
        point: s.stopName,
        landmark: s.landmark ?? undefined,
        time: toDisplayTime(s.eveningTime),
      })),
  };
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
  static async hasPublicRoutes(
    collegeId: string,
    routeIds?: string[],
  ): Promise<boolean> {
    if (routeIds && routeIds.length === 0) return false;
    return (
      (await CommuteRepository.countActiveRoutesForCollege(
        collegeId,
        routeIds,
      )) > 0
    );
  }

  static async getPublicRoutesByIds(
    collegeId: string,
    routeIds: string[],
  ): Promise<PublicCommuteRoute[]> {
    if (routeIds.length === 0) return [];
    const rows = await CommuteRepository.listPublicRoutesForCollege(
      collegeId,
      routeIds,
    );
    return rows.map(mapPublicRoute);
  }

  static async buildPublicSection(
    collegeId: string,
  ): Promise<PublicCommuteSection | null> {
    const rows = await CommuteRepository.listPublicRoutesForCollege(collegeId);
    if (rows.length === 0) return null;

    const pickupPoints = Array.from(
      new Set(
        rows.flatMap((r) =>
          r.stops.filter((s) => s.isPickupPoint).map((s) => s.stopName),
        ),
      ),
    );

    const rulesByTitle = new Map<string, PublicCommuteRule>();
    for (const row of rows) {
      for (const rule of asConductPolicy(row.conductPolicy)) {
        const key = (rule.title ?? "").trim().toLowerCase();
        if (!rulesByTitle.has(key)) rulesByTitle.set(key, rule);
      }
    }

    return {
      id: "commute",
      tab: "commute",
      title: "Commute",
      pickup_points: pickupPoints,
      routes: rows.map(mapPublicRoute),
      route_count: rows.length,
      rules_and_code_of_conduct: {
        title: "Rules & Code of Conduct",
        subtitle: "Detailed guidelines for student commuters",
        intro:
          "To ensure a safe and punctual commute for everyone, all students utilizing the transport facility must strictly adhere to the following code of conduct.",
        rules: Array.from(rulesByTitle.values()),
      },
    };
  }

  static async isEnrolled(studentId: string): Promise<boolean> {
    const enrollment = await CommuteRepository.findActiveEnrollment(studentId);
    return enrollment !== null;
  }

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
    currentBusId?: string,
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
    if (bus.id !== currentBusId && bus.availableSeats <= 0) {
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

    await this.validateSelection(data.college_id, data, existing.bus.id);

    // Updated in place: uq_commute_student_active (studentId, status) allows
    // only one non-active row per student, so close-and-recreate breaks on the
    // second modify.
    const updated = await prisma.$transaction(async (tx) => {
      if (data.bus_id !== existing.bus.id) {
        const decremented = await CommuteRepository.decrementBusSeat(
          tx,
          data.bus_id,
        );
        if (decremented.count === 0) {
          throw new ConflictError("This bus has no seats available");
        }
        await CommuteRepository.incrementBusSeat(tx, existing.bus.id);
      }
      return CommuteRepository.updateEnrollmentSelection(tx, existing.id, {
        routeId: data.route_id,
        busId: data.bus_id,
        pickupStopId: data.pickup_stop_id,
      });
    });

    const row = await CommuteRepository.findEnrollmentById(updated.id);
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
