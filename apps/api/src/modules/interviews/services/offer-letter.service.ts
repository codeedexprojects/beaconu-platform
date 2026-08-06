import { ConflictError, NotFoundError } from "@/shared/errors";
import { OfferLetterRepository } from "../repositories/offer-letter.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";

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
  /** Issues the offer letter as part of shortlisting — the course must
   * already be eligible for shortlist (interview_completed), and shortlist
   * itself is a one-time transition, so this is called right alongside
   * ApplicationCourseService.markShortlisted from the same college-admin
   * action, not as a separate later step. */
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
    return toDto(created);
  }

  /** Called from the payments module right after a token payment is
   * confirmed — keeps the OfferLetter's own tokenPaymentStatus in sync
   * with the payment, since that's the field the student status endpoint's
   * amountDetails (and its documentUrl gate) actually reads. Best-effort:
   * no offer existing at this point would mean the course reached
   * "token_paid" without ever having an offer issued, which shouldn't
   * happen given markTokenPaid requires "shortlisted" first — but a missing
   * offer here shouldn't fail an already-successful payment confirmation,
   * so this silently no-ops rather than throwing. */
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
