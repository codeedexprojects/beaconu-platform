import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListEducationLoansQuery } from "../validators/financial-aid-loans.validator";

const LOAN_LIST_SELECT = {
  id: true,
  bankName: true,
  bankLogoUrl: true,
  productName: true,
  tag: true,
  interestRate: true,
  interestRateMin: true,
  maxAmount: true,
  moratorium: true,
  processingFee: true,
  loanType: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

const LOAN_DETAIL_SELECT = {
  ...LOAN_LIST_SELECT,
  processingTime: true,
  margin: true,
  collateralAmount: true,
  nonCollateralAmount: true,
  repaymentTenure: true,
  requiresCosigner: true,
  description: true,
  expensesCovered: true,
  eligibility: true,
  eligibleCourses: true,
  documentsApplicant: true,
  documentsCoApplicant: true,
  helpfulVideos: true,
} as const;

export class EducationLoanQuery {
  static async listAll(filters: ListEducationLoansQuery) {
    const { page, limit, status, loan_type, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(loan_type ? { loanType: loan_type } : {}),
      ...(search
        ? {
            OR: [
              { bankName: { contains: search, mode: "insensitive" as const } },
              {
                productName: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.educationLoan.findMany({
        where,
        select: LOAN_LIST_SELECT,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.educationLoan.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getById(id: string) {
    const loan = await prisma.educationLoan.findUnique({
      where: { id },
      select: LOAN_DETAIL_SELECT,
    });
    if (!loan) throw new NotFoundError("Education loan not found");
    return loan;
  }

  static async listActive(filters: ListEducationLoansQuery) {
    const { page, limit, loan_type, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "active",
      ...(loan_type ? { loanType: loan_type } : {}),
      ...(search
        ? {
            OR: [
              { bankName: { contains: search, mode: "insensitive" as const } },
              {
                productName: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.educationLoan.findMany({
        where,
        select: LOAN_LIST_SELECT,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.educationLoan.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getActiveById(id: string) {
    const loan = await prisma.educationLoan.findUnique({
      where: { id, status: "active" },
      select: LOAN_DETAIL_SELECT,
    });
    if (!loan) throw new NotFoundError("Education loan not found");
    return loan;
  }
}
