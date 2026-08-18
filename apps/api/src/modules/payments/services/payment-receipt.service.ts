import { NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { uploadBuffer, permanentUrl } from "@/shared/lib/s3";
import { PaymentReceiptRepository } from "../repositories/payment-receipt.repository";
import { InvoiceDataQuery } from "../queries/invoice-data.query";
import { buildInvoicePdf } from "../lib/invoice-template";

function monthBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
  );
  return { start, end };
}

async function generateReceiptNumber(collegeId: string, collegeCode: string) {
  const now = new Date();
  const { start, end } = monthBounds(now);
  const countThisMonth = await PaymentReceiptRepository.countForCollegeInMonth(
    collegeId,
    start,
    end,
  );
  const yyyymm = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const sequence = String(countThisMonth + 1).padStart(6, "0");
  return `INV-${collegeCode}-${yyyymm}-${sequence}`;
}

export class PaymentReceiptService {
  /** Idempotent — returns the existing receipt if one already exists for
   * this transaction, instead of generating a duplicate. */
  static async issueReceipt(transactionId: string) {
    const existing =
      await PaymentReceiptRepository.findByTransactionId(transactionId);
    if (existing) return existing;

    const data = await InvoiceDataQuery.getForTransaction(transactionId);
    const receiptNumber = await generateReceiptNumber(
      data.college.id,
      data.college.code,
    );

    const pdfBuffer = await buildInvoicePdf(data, receiptNumber);

    const key = `${data.college.id}/receipts/${data.transactionId}/invoice.pdf`;
    await uploadBuffer(key, pdfBuffer, "application/pdf");
    const documentUrl = permanentUrl(key);

    const receipt = await PaymentReceiptRepository.create({
      transactionId: data.transactionId,
      studentId: data.student.id,
      collegeId: data.college.id,
      receiptNumber,
      feeCategory: data.feeCategory,
      description: data.description,
      amount: Number(data.netAmount),
      documentUrl,
    });

    logger.info({
      action: "INVOICE_GENERATED",
      module: "payments",
      transactionId,
      receiptId: receipt.id,
    });

    return receipt;
  }

  static async listMine(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    return PaymentReceiptRepository.listForStudent(studentId, pagination);
  }

  static async getById(studentId: string, receiptId: string) {
    const receipt = await PaymentReceiptRepository.findById(
      receiptId,
      studentId,
    );
    if (!receipt) throw new NotFoundError("Receipt");
    return receipt;
  }
}
