export interface EducationLoan {
  id: string;
  bankName: string;
  bankLogoUrl: string | null;
  productName: string;
  tag: string | null;
  interestRate: string;
  interestRateMin: number | null;
  maxAmount: string;
  moratorium: string;
  processingFee: string;
  loanType: "domestic" | "abroad" | "both";
  status: "active" | "inactive";
  sortOrder: number;
  processingTime: string | null;
  margin: string | null;
  collateralAmount: string | null;
  nonCollateralAmount: string | null;
  repaymentTenure: string | null;
  requiresCosigner: boolean;
  description: string | null;
  expensesCovered: string[];
  eligibility: string[];
  eligibleCourses: string | null;
  documentsApplicant: string[];
  documentsCoApplicant: string[];
  helpfulVideos: { title: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface EducationLoanListItem {
  id: string;
  bankName: string;
  bankLogoUrl: string | null;
  productName: string;
  tag: string | null;
  interestRate: string;
  interestRateMin: number | null;
  maxAmount: string;
  moratorium: string;
  processingFee: string;
  loanType: "domestic" | "abroad" | "both";
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationLoanInput {
  bank_name: string;
  bank_logo_url?: string;
  product_name: string;
  tag?: string;
  interest_rate: string;
  interest_rate_min?: number;
  max_amount: string;
  moratorium: string;
  processing_fee: string;
  loan_type: "domestic" | "abroad" | "both";
  sort_order?: number;
  processing_time?: string;
  margin?: string;
  collateral_amount?: string;
  non_collateral_amount?: string;
  repayment_tenure?: string;
  requires_cosigner?: boolean;
  description?: string;
  expenses_covered?: string[];
  eligibility?: string[];
  eligible_courses?: string;
  documents_applicant?: string[];
  documents_co_applicant?: string[];
  helpful_videos?: { title: string; url: string }[];
}

export interface UpdateEducationLoanInput {
  bank_name?: string;
  bank_logo_url?: string;
  product_name?: string;
  tag?: string;
  interest_rate?: string;
  interest_rate_min?: number | null;
  max_amount?: string;
  moratorium?: string;
  processing_fee?: string;
  loan_type?: "domestic" | "abroad" | "both";
  status?: "active" | "inactive";
  sort_order?: number;
  processing_time?: string;
  margin?: string;
  collateral_amount?: string;
  non_collateral_amount?: string;
  repayment_tenure?: string;
  requires_cosigner?: boolean;
  description?: string;
  expenses_covered?: string[];
  eligibility?: string[];
  eligible_courses?: string;
  documents_applicant?: string[];
  documents_co_applicant?: string[];
  helpful_videos?: { title: string; url: string }[];
}
