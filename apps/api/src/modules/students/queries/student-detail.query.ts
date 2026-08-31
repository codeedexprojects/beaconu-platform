import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type { StudentProfileMetadata } from "@beaconu/types";

function mapLedgerEntry(row: {
  id: string;
  feeCategory: string;
  description: string | null;
  netAmount: { toString(): string };
  paidAmount: { toString(): string };
  balanceAmount: { toString(): string };
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  transactions: {
    id: string;
    transactionNumber: string;
    amount: { toString(): string };
    status: string;
    paymentMethod: string;
    paidAt: Date | null;
    createdAt: Date;
  }[];
}) {
  return {
    id: row.id,
    feeCategory: row.feeCategory,
    description: row.description,
    amount: row.netAmount.toString(),
    paidAmount: row.paidAmount.toString(),
    balanceAmount: row.balanceAmount.toString(),
    status: row.status,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    createdAt: row.createdAt.toISOString(),
    transactions: row.transactions.map((txn) => ({
      id: txn.id,
      transactionNumber: txn.transactionNumber,
      amount: txn.amount.toString(),
      status: txn.status,
      paymentMethod: txn.paymentMethod,
      paidAt: txn.paidAt ? txn.paidAt.toISOString() : null,
      createdAt: txn.createdAt.toISOString(),
    })),
  };
}

export class StudentDetailQuery {
  static async getForCollege(collegeId: string, studentId: string) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, collegeId },
      select: {
        id: true,
        enrollmentNumber: true,
        academicYear: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        course: {
          select: { id: true, name: true, code: true, duration: true },
        },
        applicationCourse: { select: { applicationId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
    if (!enrollment) throw new NotFoundError("Enrolled student not found");

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneCountryCode: true,
        phoneNumber: true,
        avatarUrl: true,
        status: true,
        profileMetadata: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!student) throw new NotFoundError("Student not found");

    const [
      hostelEnrollment,
      commuteEnrollment,
      ledgerRows,
      documentRequests,
      supportTickets,
      card,
    ] = await Promise.all([
      prisma.hostelEnrollment.findFirst({
        where: { studentId, collegeId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          roomPlanType: true,
          dietaryPreference: true,
          selectedAddons: true,
          feeBreakdown: true,
          enrolledFrom: true,
          enrolledUntil: true,
          hostel: { select: { id: true, name: true, hostelType: true } },
          roomType: {
            select: {
              id: true,
              name: true,
              annualPlanPrice: true,
              monthlyPlanPrice: true,
              admissionFee: true,
              securityDeposit: true,
            },
          },
          messPlan: { select: { id: true, name: true, priceMonthly: true } },
        },
      }),
      prisma.commuteEnrollment.findFirst({
        where: { studentId, collegeId },
        orderBy: { createdAt: "desc" },
        select: {
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
              driverName: true,
              driverPhone: true,
              driverStatus: true,
              monthlyFee: true,
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
        },
      }),
      prisma.studentFeeLedger.findMany({
        where: { studentId, collegeId },
        select: {
          id: true,
          feeCategory: true,
          description: true,
          netAmount: true,
          paidAmount: true,
          balanceAmount: true,
          status: true,
          dueDate: true,
          createdAt: true,
          transactions: {
            select: {
              id: true,
              transactionNumber: true,
              amount: true,
              status: true,
              paymentMethod: true,
              paidAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.documentSubmissionRequest.findMany({
        where: { studentId, collegeId },
        select: {
          id: true,
          documentCategory: true,
          documentName: true,
          status: true,
          deadline: true,
          fileUrl: true,
          submittedAt: true,
          rejectionReason: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.findMany({
        where: { studentId, collegeId },
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.beaconuCard.findUnique({
        where: { studentId },
        select: {
          id: true,
          cardNumber: true,
          cardHolderName: true,
          validUntil: true,
          balance: true,
          totalEarned: true,
          totalWithdrawn: true,
          status: true,
        },
      }),
    ]);

    const hostelFees = ledgerRows.filter(
      (row) => row.feeCategory === "hostel_booking_fee",
    );
    const commuteFees = ledgerRows.filter(
      (row) => row.feeCategory === "commute_fee",
    );
    const courseFees = ledgerRows.filter(
      (row) =>
        row.feeCategory !== "hostel_booking_fee" &&
        row.feeCategory !== "commute_fee",
    );
    const totalPaid = ledgerRows.reduce(
      (sum, row) => sum + row.paidAmount.toNumber(),
      0,
    );
    const totalDue = ledgerRows.reduce(
      (sum, row) => sum + row.balanceAmount.toNumber(),
      0,
    );

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phoneCountryCode: student.phoneCountryCode,
      phoneNumber: student.phoneNumber,
      avatarUrl: student.avatarUrl,
      status: student.status,
      profileMetadata: (student.profileMetadata ??
        {}) as StudentProfileMetadata,
      lastLoginAt: student.lastLoginAt
        ? student.lastLoginAt.toISOString()
        : null,
      createdAt: student.createdAt.toISOString(),
      enrollment: {
        id: enrollment.id,
        enrollmentNumber: enrollment.enrollmentNumber,
        academicYear: enrollment.academicYear,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt
          ? enrollment.completedAt.toISOString()
          : null,
        courseId: enrollment.course.id,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code,
        courseDuration: enrollment.course.duration,
        applicationId: enrollment.applicationCourse.applicationId,
      },
      hostel: hostelEnrollment
        ? {
            id: hostelEnrollment.id,
            status: hostelEnrollment.status,
            roomPlanType: hostelEnrollment.roomPlanType,
            dietaryPreference: hostelEnrollment.dietaryPreference,
            selectedAddons: hostelEnrollment.selectedAddons as {
              addon_service_id: string;
              plan_label: string;
            }[],
            feeBreakdown: hostelEnrollment.feeBreakdown as Record<
              string,
              unknown
            >,
            enrolledFrom: hostelEnrollment.enrolledFrom
              .toISOString()
              .slice(0, 10),
            enrolledUntil: hostelEnrollment.enrolledUntil
              ? hostelEnrollment.enrolledUntil.toISOString().slice(0, 10)
              : null,
            hostel: hostelEnrollment.hostel,
            roomType: {
              id: hostelEnrollment.roomType.id,
              name: hostelEnrollment.roomType.name,
              annualPlanPrice: hostelEnrollment.roomType.annualPlanPrice
                ? hostelEnrollment.roomType.annualPlanPrice.toString()
                : null,
              monthlyPlanPrice: hostelEnrollment.roomType.monthlyPlanPrice
                ? hostelEnrollment.roomType.monthlyPlanPrice.toString()
                : null,
              admissionFee: hostelEnrollment.roomType.admissionFee.toString(),
              securityDeposit:
                hostelEnrollment.roomType.securityDeposit.toString(),
            },
            messPlan: hostelEnrollment.messPlan
              ? {
                  id: hostelEnrollment.messPlan.id,
                  name: hostelEnrollment.messPlan.name,
                  priceMonthly:
                    hostelEnrollment.messPlan.priceMonthly.toString(),
                }
              : null,
          }
        : null,
      commute: commuteEnrollment
        ? {
            id: commuteEnrollment.id,
            status: commuteEnrollment.status,
            enrolledFrom: commuteEnrollment.enrolledFrom
              .toISOString()
              .slice(0, 10),
            enrolledUntil: commuteEnrollment.enrolledUntil
              ? commuteEnrollment.enrolledUntil.toISOString().slice(0, 10)
              : null,
            route: commuteEnrollment.route,
            bus: {
              ...commuteEnrollment.bus,
              monthlyFee: commuteEnrollment.bus.monthlyFee.toString(),
            },
            pickupStop: {
              id: commuteEnrollment.pickupStop.id,
              stopName: commuteEnrollment.pickupStop.stopName,
              morningTime: commuteEnrollment.pickupStop.morningTime
                ? commuteEnrollment.pickupStop.morningTime
                    .toISOString()
                    .slice(11, 16)
                : null,
              eveningTime: commuteEnrollment.pickupStop.eveningTime
                ? commuteEnrollment.pickupStop.eveningTime
                    .toISOString()
                    .slice(11, 16)
                : null,
            },
          }
        : null,
      payments: {
        courseFees: courseFees.map(mapLedgerEntry),
        hostelFees: hostelFees.map(mapLedgerEntry),
        commuteFees: commuteFees.map(mapLedgerEntry),
        totalPaid: totalPaid.toString(),
        totalDue: totalDue.toString(),
      },
      documentRequests: documentRequests.map((row) => ({
        id: row.id,
        documentCategory: row.documentCategory,
        documentName: row.documentName,
        status: row.status,
        deadline: row.deadline.toISOString().slice(0, 10),
        fileUrl: row.fileUrl,
        submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
        rejectionReason: row.rejectionReason,
        createdAt: row.createdAt.toISOString(),
      })),
      supportTickets: supportTickets.map((row) => ({
        id: row.id,
        ticketNumber: row.ticketNumber,
        subject: row.subject,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      beaconuCard: card
        ? {
            id: card.id,
            cardNumber: card.cardNumber,
            cardHolderName: card.cardHolderName,
            validUntil: card.validUntil.toISOString().slice(0, 10),
            balance: card.balance.toString(),
            totalEarned: card.totalEarned.toString(),
            totalWithdrawn: card.totalWithdrawn.toString(),
            status: card.status,
          }
        : null,
    };
  }
}
