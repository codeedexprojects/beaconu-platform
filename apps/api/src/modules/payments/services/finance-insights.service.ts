import { SeatCancellationService } from "@/modules/admissions/services/seat-cancellation.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { ScholarshipApplicationService } from "@/modules/scholarships/services/scholarship-application.service";
import { FinanceSummaryQuery } from "../queries/finance-summary.query";

export class FinanceInsightsService {
  static async getInsights(collegeId: string) {
    const [collections, revenueByCourse, refunds, tokenPipeline, scholarships] =
      await Promise.all([
        FinanceSummaryQuery.getCollectionsHealth(collegeId),
        FinanceSummaryQuery.getRevenueByCourse(collegeId),
        SeatCancellationService.getRefundSummary(collegeId),
        OfferLetterService.getTokenPipelineSummary(collegeId),
        ScholarshipApplicationService.getDiscountSummary(collegeId),
      ]);

    return {
      ...collections,
      refunds,
      tokenPipeline,
      scholarships,
      revenueByCourse,
    };
  }
}
