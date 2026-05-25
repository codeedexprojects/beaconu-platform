import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { EducationLoansRepository } from "../repositories/financial-aid-loans.repository";
import {
  CreateEducationLoanInput,
  UpdateEducationLoanInput,
} from "../validators/financial-aid-loans.validator";

export class EducationLoansService {
  static async create(data: CreateEducationLoanInput) {
    return EducationLoansRepository.create({
      bankName: data.bank_name,
      bankLogoUrl: data.bank_logo_url ?? null,
      productName: data.product_name,
      tag: data.tag ?? null,
      interestRate: data.interest_rate,
      interestRateMin: data.interest_rate_min ?? null,
      maxAmount: data.max_amount,
      moratorium: data.moratorium,
      processingFee: data.processing_fee,
      loanType: data.loan_type,
      status: "active",
      sortOrder: data.sort_order ?? 0,
      processingTime: data.processing_time ?? null,
      margin: data.margin ?? null,
      collateralAmount: data.collateral_amount ?? null,
      nonCollateralAmount: data.non_collateral_amount ?? null,
      repaymentTenure: data.repayment_tenure ?? null,
      requiresCosigner: data.requires_cosigner ?? false,
      description: data.description ?? null,
      expensesCovered: data.expenses_covered ?? [],
      eligibility: data.eligibility ?? [],
      eligibleCourses: data.eligible_courses ?? null,
      documentsApplicant: data.documents_applicant ?? [],
      documentsCoApplicant: data.documents_co_applicant ?? [],
      helpfulVideos: data.helpful_videos ?? [],
    });
  }

  static async update(id: string, data: UpdateEducationLoanInput) {
    const existing = await EducationLoansRepository.findById(id);
    if (!existing) throw new NotFoundError("Education loan not found");

    return EducationLoansRepository.updateById(id, {
      ...(data.bank_name !== undefined ? { bankName: data.bank_name } : {}),
      ...(data.bank_logo_url !== undefined
        ? { bankLogoUrl: data.bank_logo_url }
        : {}),
      ...(data.product_name !== undefined
        ? { productName: data.product_name }
        : {}),
      ...(data.tag !== undefined ? { tag: data.tag } : {}),
      ...(data.interest_rate !== undefined
        ? { interestRate: data.interest_rate }
        : {}),
      ...(data.interest_rate_min !== undefined
        ? { interestRateMin: data.interest_rate_min }
        : {}),
      ...(data.max_amount !== undefined ? { maxAmount: data.max_amount } : {}),
      ...(data.moratorium !== undefined ? { moratorium: data.moratorium } : {}),
      ...(data.processing_fee !== undefined
        ? { processingFee: data.processing_fee }
        : {}),
      ...(data.loan_type !== undefined ? { loanType: data.loan_type } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.sort_order !== undefined ? { sortOrder: data.sort_order } : {}),
      ...(data.processing_time !== undefined
        ? { processingTime: data.processing_time }
        : {}),
      ...(data.margin !== undefined ? { margin: data.margin } : {}),
      ...(data.collateral_amount !== undefined
        ? { collateralAmount: data.collateral_amount }
        : {}),
      ...(data.non_collateral_amount !== undefined
        ? { nonCollateralAmount: data.non_collateral_amount }
        : {}),
      ...(data.repayment_tenure !== undefined
        ? { repaymentTenure: data.repayment_tenure }
        : {}),
      ...(data.requires_cosigner !== undefined
        ? { requiresCosigner: data.requires_cosigner }
        : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.expenses_covered !== undefined
        ? { expensesCovered: data.expenses_covered }
        : {}),
      ...(data.eligibility !== undefined
        ? { eligibility: data.eligibility }
        : {}),
      ...(data.eligible_courses !== undefined
        ? { eligibleCourses: data.eligible_courses }
        : {}),
      ...(data.documents_applicant !== undefined
        ? { documentsApplicant: data.documents_applicant }
        : {}),
      ...(data.documents_co_applicant !== undefined
        ? { documentsCoApplicant: data.documents_co_applicant }
        : {}),
      ...(data.helpful_videos !== undefined
        ? { helpfulVideos: data.helpful_videos }
        : {}),
    });
  }

  static async deactivate(id: string) {
    const existing = await EducationLoansRepository.findById(id);
    if (!existing) throw new NotFoundError("Education loan not found");
    if (existing.status === "inactive")
      throw new ForbiddenError("Education loan is already inactive");
    return EducationLoansRepository.softDeactivateById(id);
  }

  static async activate(id: string) {
    const existing = await EducationLoansRepository.findById(id);
    if (!existing) throw new NotFoundError("Education loan not found");
    if (existing.status === "active")
      throw new ForbiddenError("Education loan is already active");
    return EducationLoansRepository.updateById(id, { status: "active" });
  }
}
