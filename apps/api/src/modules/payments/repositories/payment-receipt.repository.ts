import { prisma } from "@beaconu/db";

const RECEIPT_SELECT = {
  id: true,
  transactionId: true,
  receiptNumber: true,
  receiptDate: true,
  feeCategory: true,
  description: true,
  amount: true,
  documentUrl: true,
  createdAt: true,
} as const;

export class PaymentReceiptRepository {
  static async findByTransactionId(transactionId: string) {
    return prisma.paymentReceipt.findUnique({
      where: { transactionId },
      select: RECEIPT_SELECT,
    });
  }

  static async findById(id: string, studentId: string) {
    return prisma.paymentReceipt.findFirst({
      where: { id, studentId },
      select: RECEIPT_SELECT,
    });
  }

  static async findByTransactionIdForStudent(
    transactionId: string,
    studentId: string,
  ) {
    return prisma.paymentReceipt.findFirst({
      where: { transactionId, studentId },
      select: RECEIPT_SELECT,
    });
  }

  static async countForCollegeInMonth(
    collegeId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<number> {
    return prisma.paymentReceipt.count({
      where: {
        collegeId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    });
  }

  static async create(data: {
    transactionId: string;
    studentId: string;
    collegeId: string;
    receiptNumber: string;
    feeCategory: string;
    description: string | null;
    amount: number;
    documentUrl: string;
  }) {
    return prisma.paymentReceipt.create({
      data,
      select: RECEIPT_SELECT,
    });
  }

  static async listForStudent(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      prisma.paymentReceipt.findMany({
        where: { studentId },
        select: RECEIPT_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: pagination.limit,
      }),
      prisma.paymentReceipt.count({ where: { studentId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}
