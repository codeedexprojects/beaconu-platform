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
  static async findByOfferNumber(offerNumber: string) {
    return prisma.offerLetter.findUnique({ where: { offerNumber } });
  }

  static async findByApplicationCourseId(applicationCourseId: string) {
    return prisma.offerLetter.findUnique({
      where: { applicationCourseId },
      select: OFFER_LETTER_SELECT,
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
