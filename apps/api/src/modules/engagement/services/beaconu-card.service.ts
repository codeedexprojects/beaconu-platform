import { prisma, Prisma } from "@beaconu/db";
import { StudentsService } from "@/modules/students/services/students.service";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { CommuteService } from "@/modules/commute/services/commute.service";
import { HostelEnrollmentService } from "@/modules/hostel/services/hostel-enrollment.service";
import { BeaconuCardRepository } from "../repositories/beaconu-card.repository";

const CARD_VALIDITY_YEARS = 5;

function addYearToDuration(duration: string | null): string | null {
  if (!duration) return null;
  const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*(month|year)?/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = (match[2] ?? "year").toLowerCase();
  const years = unit.startsWith("month") ? value / 12 : value;
  const total = years + 1;

  const formatted = Number.isInteger(total)
    ? total.toString()
    : total.toFixed(1);
  return `${formatted} Years`;
}

function randomDigits(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 10).toString(),
  ).join("");
}

async function generateCardNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `BCU${randomDigits(12)}`;
    const existing = await BeaconuCardRepository.findByCardNumber(candidate);
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique BeaconU card number, retry");
}

function toDto(
  row: NonNullable<
    Awaited<ReturnType<typeof BeaconuCardRepository.findByStudentId>>
  >,
) {
  return {
    id: row.id,
    cardNumber: row.cardNumber,
    cardHolderName: row.cardHolderName,
    validUntil: row.validUntil.toISOString(),
    balance: row.balance.toString(),
    totalEarned: row.totalEarned.toString(),
    totalWithdrawn: row.totalWithdrawn.toString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

async function withEnrollmentDetails(
  studentId: string,
  card: ReturnType<typeof toDto>,
) {
  const [enrollmentSummary, commuteEnrolled, housingEnrolled] =
    await Promise.all([
      EnrollmentService.getActiveSummary(studentId),
      CommuteService.isEnrolled(studentId),
      HostelEnrollmentService.isEnrolled(studentId),
    ]);

  return {
    ...card,
    collegeId: enrollmentSummary?.collegeId ?? null,
    collegeName: enrollmentSummary?.collegeName ?? null,
    courseName: enrollmentSummary?.courseName ?? null,
    duration: addYearToDuration(enrollmentSummary?.courseDuration ?? null),
    commuteEnrolled,
    housingEnrolled,
  };
}

export class BeaconuCardService {
  static async ensureCardForStudent(
    tx: Prisma.TransactionClient,
    studentId: string,
    cardHolderName: string,
  ) {
    const existing = await BeaconuCardRepository.findByStudentId(studentId);
    if (existing) return toDto(existing);

    const cardNumber = await generateCardNumber();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + CARD_VALIDITY_YEARS);

    const created = await BeaconuCardRepository.create(tx, {
      studentId,
      cardNumber,
      cardHolderName,
      validUntil,
    });
    return toDto(created);
  }

  static async getMine(studentId: string) {
    const existing = await BeaconuCardRepository.findByStudentId(studentId);
    let card = existing ? toDto(existing) : null;

    if (!card) {
      const fullName = await StudentsService.getFullName(studentId);
      card = await prisma.$transaction((tx) =>
        this.ensureCardForStudent(tx, studentId, fullName),
      );
    }

    return withEnrollmentDetails(studentId, card);
  }
}
