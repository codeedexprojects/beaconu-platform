import { istToday } from "@/shared/utils/ist-time.utils";
import { prisma } from "@beaconu/db";

const OFFER_LETTER_SELECT = {
  id: true,
  applicationCourseId: true,
  studentId: true,
  collegeId: true,
  offerNumber: true,
  offerDate: true,
  validUntil: true,
  tokenAmount: true,
  tokenPaymentStatus: true,
  documentUrl: true,
  status: true,
  issuedBy: true,
  createdAt: true,
} as const;

export class OfferLetterRepository {
  /** Unpaid tokens split by whether the offer is still inside its validity
   * window. There is no offer-expiry job, so lapsed offers stay "issued"
   * with a pending token forever — validUntil is the only signal. */
  static async getPendingTokenTotalsForCollege(collegeId: string) {
    const today = istToday();
    const base = { collegeId, status: "issued", tokenPaymentStatus: "pending" };
    const [live, lapsed] = await Promise.all([
      prisma.offerLetter.aggregate({
        where: { ...base, validUntil: { gte: today } },
        _sum: { tokenAmount: true },
        _count: { _all: true },
      }),
      prisma.offerLetter.aggregate({
        where: { ...base, validUntil: { lt: today } },
        _sum: { tokenAmount: true },
        _count: { _all: true },
      }),
    ]);
    return { live, lapsed };
  }

  static async findByOfferNumber(offerNumber: string) {
    return prisma.offerLetter.findUnique({ where: { offerNumber } });
  }

  static async findByApplicationCourseId(applicationCourseId: string) {
    return prisma.offerLetter.findUnique({
      where: { applicationCourseId },
      select: OFFER_LETTER_SELECT,
    });
  }

  static async markTokenPaid(
    applicationCourseId: string,
    tokenTransactionId: string,
  ) {
    return prisma.offerLetter.updateMany({
      where: { applicationCourseId },
      data: { tokenPaymentStatus: "paid", tokenTransactionId },
    });
  }

  static async create(data: {
    applicationCourseId: string;
    studentId: string;
    collegeId: string;
    offerNumber: string;
    validUntil: Date;
    tokenAmount: number;
    documentUrl: string;
    issuedBy: string;
  }) {
    return prisma.offerLetter.create({
      data: {
        applicationCourseId: data.applicationCourseId,
        studentId: data.studentId,
        collegeId: data.collegeId,
        offerNumber: data.offerNumber,
        validUntil: data.validUntil,
        tokenAmount: data.tokenAmount,
        documentUrl: data.documentUrl,
        issuedBy: data.issuedBy,
      },
      select: OFFER_LETTER_SELECT,
    });
  }
}
