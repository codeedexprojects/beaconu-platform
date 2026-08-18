import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";

// Human-readable labels for every fee_category value actually seen in the
// database — the 7 categories real payment flows create today, plus the
// stray/legacy ones found in existing data (no active code path writes
// these anymore, but old rows still need a sane label if backfilled).
const FEE_CATEGORY_LABELS: Record<string, string> = {
  application_fee: "Application Fee",
  token_fee: "Token Fee (Admission Confirmation)",
  commute_fee: "Commute Fee",
  hostel_booking_fee: "Hostel Booking Fee",
  semester_fees: "Course Fee",
  admission_fee: "Admission Fee",
  hostel_fee: "Hostel Fee",
  library_fee: "Library Fee",
  "tution fee": "Tuition Fee",
};

function feeCategoryLabel(feeCategory: string): string {
  return FEE_CATEGORY_LABELS[feeCategory] ?? "Fee Payment";
}

export interface InvoiceData {
  transactionId: string;
  transactionNumber: string;
  paidAt: string;
  paymentMethod: string;
  razorpayPaymentId: string | null;
  currency: string;
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  college: {
    id: string;
    name: string;
    code: string;
    logoUrl: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pinCode: string | null;
  };
  feeCategory: string;
  feeCategoryLabel: string;
  description: string | null;
  grossAmount: string;
  scholarshipDiscount: string;
  netAmount: string;
}

export class InvoiceDataQuery {
  static async getForTransaction(transactionId: string): Promise<InvoiceData> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        transactionNumber: true,
        paidAt: true,
        paymentMethod: true,
        razorpayPaymentId: true,
        currency: true,
        amount: true,
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            address: true,
            city: true,
            state: true,
            pinCode: true,
          },
        },
        ledgerEntry: {
          select: {
            feeCategory: true,
            description: true,
            totalAmount: true,
            scholarshipDiscount: true,
            netAmount: true,
          },
        },
      },
    });

    if (!transaction) throw new NotFoundError("Transaction");
    if (!transaction.paidAt) {
      throw new NotFoundError("Transaction has not been paid yet");
    }

    const ledger = transaction.ledgerEntry;
    const feeCategory = ledger?.feeCategory ?? "unknown";

    return {
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber,
      paidAt: transaction.paidAt.toISOString(),
      paymentMethod: transaction.paymentMethod,
      razorpayPaymentId: transaction.razorpayPaymentId,
      currency: transaction.currency,
      student: transaction.student,
      college: transaction.college,
      feeCategory,
      feeCategoryLabel: feeCategoryLabel(feeCategory),
      description: ledger?.description ?? null,
      grossAmount: (ledger?.totalAmount ?? transaction.amount).toString(),
      scholarshipDiscount: (ledger?.scholarshipDiscount ?? 0).toString(),
      netAmount: (ledger?.netAmount ?? transaction.amount).toString(),
    };
  }
}
