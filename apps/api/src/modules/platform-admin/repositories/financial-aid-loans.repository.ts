import { prisma } from "@beaconu/db";

const LOAN_SELECT = {
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
  createdAt: true,
  updatedAt: true,
} as const;

export class EducationLoansRepository {
  static async findById(id: string) {
    return prisma.educationLoan.findUnique({
      where: { id },
      select: LOAN_SELECT,
    });
  }

  static async create(data: {
    bankName: string;
    bankLogoUrl?: string | null;
    productName: string;
    tag?: string | null;
    interestRate: string;
    interestRateMin?: number | null;
    maxAmount: string;
    moratorium: string;
    processingFee: string;
    loanType: string;
    status: string;
    sortOrder: number;
    processingTime?: string | null;
    margin?: string | null;
    collateralAmount?: string | null;
    nonCollateralAmount?: string | null;
    repaymentTenure?: string | null;
    requiresCosigner: boolean;
    description?: string | null;
    expensesCovered: string[];
    eligibility: string[];
    eligibleCourses?: string | null;
    documentsApplicant: string[];
    documentsCoApplicant: string[];
    helpfulVideos: { title: string; url: string }[];
  }) {
    return prisma.educationLoan.create({ data, select: LOAN_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      bankName?: string;
      bankLogoUrl?: string | null;
      productName?: string;
      tag?: string | null;
      interestRate?: string;
      interestRateMin?: number | null;
      maxAmount?: string;
      moratorium?: string;
      processingFee?: string;
      loanType?: string;
      status?: string;
      sortOrder?: number;
      processingTime?: string | null;
      margin?: string | null;
      collateralAmount?: string | null;
      nonCollateralAmount?: string | null;
      repaymentTenure?: string | null;
      requiresCosigner?: boolean;
      description?: string | null;
      expensesCovered?: string[];
      eligibility?: string[];
      eligibleCourses?: string | null;
      documentsApplicant?: string[];
      documentsCoApplicant?: string[];
      helpfulVideos?: { title: string; url: string }[];
    },
  ) {
    return prisma.educationLoan.update({
      where: { id },
      data,
      select: LOAN_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.educationLoan.update({
      where: { id },
      data: { status: "inactive" },
      select: LOAN_SELECT,
    });
  }
}
