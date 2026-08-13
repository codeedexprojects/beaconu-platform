import { ConflictError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { OfferLetterRepository } from "../repositories/offer-letter.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";

async function notifyStudentOfOffer(
  studentId: string,
  offerNumber: string,
  tokenAmount: number,
): Promise<void> {
  try {
    await PushService.sendToUser(studentId, "student", {
      title: "You've received an offer letter!",
      body: `Offer #${offerNumber} issued — pay the token fee of ₹${tokenAmount} to secure your seat.`,
      data: { type: "offer_issued", offerNumber },
    });
  } catch (error) {
    logger.error(
      { err: error, studentId },
      "Failed to notify student of offer letter",
    );
  }
}

function randomOfferSuffix(): string {
  return Array.from({ length: 8 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 33)),
  ).join("");
}

async function generateOfferNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `OFR-${randomOfferSuffix()}`;
    const existing = await OfferLetterRepository.findByOfferNumber(candidate);
    if (!existing) return candidate;
  }
  throw new ConflictError("Could not generate a unique offer number, retry");
}

function toDto(
  row: NonNullable<
    Awaited<ReturnType<typeof OfferLetterRepository.findByApplicationCourseId>>
  >,
) {
  return {
    ...row,
    offerDate: row.offerDate.toISOString(),
    validUntil: row.validUntil.toISOString(),
    tokenAmount: row.tokenAmount.toString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class OfferLetterService {
  static async issueForShortlist(
    collegeId: string,
    staffId: string,
    applicationCourseId: string,
    data: { documentUrl: string; validUntil: Date },
  ) {
    const course =
      await ApplicationCourseService.getForOfferIssuance(applicationCourseId);
    if (course.collegeId !== collegeId) {
      throw new NotFoundError("Application course not found");
    }

    const existing =
      await OfferLetterRepository.findByApplicationCourseId(
        applicationCourseId,
      );
    if (existing) return toDto(existing);

    const tokenAmount = await ApplicationCourseService.getConfiguredTokenAmount(
      course.admissionCycleId,
      course.courseId,
    );
    if (tokenAmount === null) {
      throw new ConflictError(
        "Set a token amount for this course on the admission cycle before shortlisting",
      );
    }

    await ApplicationCourseService.markShortlisted(
      applicationCourseId,
      staffId,
    );

    const offerNumber = await generateOfferNumber();
    const created = await OfferLetterRepository.create({
      applicationCourseId,
      studentId: course.studentId,
      collegeId: course.collegeId,
      offerNumber,
      validUntil: data.validUntil,
      tokenAmount: Number(tokenAmount),
      documentUrl: data.documentUrl,
      issuedBy: staffId,
    });
    await notifyStudentOfOffer(
      course.studentId,
      offerNumber,
      Number(tokenAmount),
    );
    return toDto(created);
  }

  static async markTokenPaid(
    applicationCourseId: string,
    transactionId: string,
  ) {
    await OfferLetterRepository.markTokenPaid(
      applicationCourseId,
      transactionId,
    );
  }
}
