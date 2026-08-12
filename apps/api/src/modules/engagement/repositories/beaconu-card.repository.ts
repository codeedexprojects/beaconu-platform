import { prisma, Prisma } from "@beaconu/db";

const CARD_SELECT = {
  id: true,
  cardNumber: true,
  cardHolderName: true,
  validUntil: true,
  balance: true,
  totalEarned: true,
  totalWithdrawn: true,
  status: true,
  createdAt: true,
} as const;

export class BeaconuCardRepository {
  static async findByStudentId(studentId: string) {
    return prisma.beaconuCard.findUnique({
      where: { studentId },
      select: CARD_SELECT,
    });
  }

  static async findByCardNumber(cardNumber: string) {
    return prisma.beaconuCard.findUnique({
      where: { cardNumber },
      select: { id: true },
    });
  }

  static async create(
    tx: Prisma.TransactionClient,
    data: {
      studentId: string;
      cardNumber: string;
      cardHolderName: string;
      validUntil: Date;
    },
  ) {
    return tx.beaconuCard.create({
      data,
      select: CARD_SELECT,
    });
  }

  static async setStatus(
    tx: Prisma.TransactionClient,
    studentId: string,
    status: string,
  ) {
    return tx.beaconuCard.updateMany({
      where: { studentId },
      data: { status },
    });
  }
}
