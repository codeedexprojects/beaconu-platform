-- CreateTable
CREATE TABLE "education_loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bank_name" VARCHAR(255) NOT NULL,
    "bank_logo_url" TEXT,
    "product_name" VARCHAR(255) NOT NULL,
    "tag" VARCHAR(100),
    "interest_rate" VARCHAR(100) NOT NULL,
    "interest_rate_min" DECIMAL(5,2),
    "max_amount" VARCHAR(100) NOT NULL,
    "moratorium" VARCHAR(100) NOT NULL,
    "processing_fee" VARCHAR(100) NOT NULL,
    "loan_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "processing_time" VARCHAR(100),
    "margin" VARCHAR(100),
    "collateral_amount" VARCHAR(100),
    "non_collateral_amount" VARCHAR(100),
    "repayment_tenure" VARCHAR(100),
    "requires_cosigner" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "expenses_covered" JSONB NOT NULL DEFAULT '[]',
    "eligibility" JSONB NOT NULL DEFAULT '[]',
    "eligible_courses" TEXT,
    "documents_applicant" JSONB NOT NULL DEFAULT '[]',
    "documents_co_applicant" JSONB NOT NULL DEFAULT '[]',
    "helpful_videos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "education_loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_education_loans_status" ON "education_loans"("status");

-- CreateIndex
CREATE INDEX "idx_education_loans_loan_type" ON "education_loans"("loan_type");

-- CreateIndex
CREATE INDEX "idx_education_loans_sort_order" ON "education_loans"("sort_order");
