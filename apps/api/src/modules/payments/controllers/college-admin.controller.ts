import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import { TokenPaymentService } from "../services/token-payment.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import { enqueueInvoiceGeneration } from "../jobs/invoice-generation.job";
import {
  listOfflineReviewQueueQuerySchema,
  reviewOfflineTokenPaymentSchema,
} from "../validators/token-payment.validator";
import {
  financeOverviewQuerySchema,
  financeTransactionsQuerySchema,
  financeTransactionsExportQuerySchema,
} from "../validators/finance.validator";
import { FinanceSummaryQuery } from "../queries/finance-summary.query";

function toCsv(
  rows: Array<{
    time: string;
    studentId: string;
    studentName: string;
    transactionNumber: string;
    feeCategory: string | null;
    paymentMethodLabel: string;
    amount: string;
    direction: string;
    status: string;
  }>,
): string {
  const header = [
    "Time",
    "Student",
    "Student ID",
    "Transaction Ref",
    "Fee Type",
    "Method",
    "Amount",
    "Direction",
    "Status",
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [
      row.time,
      row.studentName,
      row.studentId,
      row.transactionNumber,
      row.feeCategory ?? "",
      row.paymentMethodLabel,
      row.amount,
      row.direction,
      row.status,
    ]
      .map((cell) => escape(String(cell)))
      .join(","),
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

export class CollegeAdminPaymentController {
  static async listOfflineReviewQueue(req: Request, res: Response) {
    const query = listOfflineReviewQueueQuerySchema.parse(req.query);
    const result = await TokenPaymentService.listOfflineForReview(
      req.collegeId as string,
      {
        verificationStatus: query.status,
        page: query.page,
        limit: query.limit,
      },
    );
    return res.json(
      ApiResponse.success(
        "Offline review queue fetched",
        result.data,
        PaginationHelper.createMeta(result.total, query.page, query.limit),
      ),
    );
  }

  static async reviewOfflineTokenPayment(req: Request, res: Response) {
    const body = reviewOfflineTokenPaymentSchema.parse(req.body);
    const result = await TokenPaymentService.reviewOffline(
      req.params.transactionId as string,
      req.userId as string,
      body,
    );

    if (result.finalized) {
      await ApplicationCourseService.markTokenPaid(
        result.applicationCourseId,
        result.studentId,
      );
      await OfferLetterService.markTokenPaid(
        result.applicationCourseId,
        result.id,
      );
      await notifyPaymentConfirmed(
        result.studentId,
        "token fee",
        Number(result.amount),
      );
      await enqueueInvoiceGeneration(result.id);
    }

    return res.json(ApiResponse.success("Offline payment reviewed", result));
  }

  static async getFinanceOverview(req: Request, res: Response) {
    const query = financeOverviewQuerySchema.parse(req.query);
    const result = await FinanceSummaryQuery.getOverview(
      req.collegeId as string,
      query,
    );
    return res.json(ApiResponse.success("Finance overview fetched", result));
  }

  static async listFinanceTransactions(req: Request, res: Response) {
    const query = financeTransactionsQuerySchema.parse(req.query);
    const result = await FinanceSummaryQuery.listTransactions(
      req.collegeId as string,
      query,
    );
    return res.json(
      ApiResponse.success(
        "Finance transactions fetched",
        result.data,
        result.meta,
      ),
    );
  }

  static async exportFinanceTransactions(req: Request, res: Response) {
    const query = financeTransactionsExportQuerySchema.parse(req.query);
    const rows = await FinanceSummaryQuery.listTransactionsForExport(
      req.collegeId as string,
      query,
    );
    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    return res.status(200).send(csv);
  }
}
