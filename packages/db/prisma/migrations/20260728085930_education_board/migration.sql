-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS education_board_seq;
CREATE SEQUENCE IF NOT EXISTS education_board_subject_seq;

-- CreateTable
CREATE TABLE "education_boards" (
    "id" TEXT NOT NULL DEFAULT ('EDB-'::text || (nextval('education_board_seq'::regclass))::text),
    "name" VARCHAR(150) NOT NULL,
    "grade" VARCHAR(10) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "education_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_board_subjects" (
    "id" TEXT NOT NULL DEFAULT ('EBS-'::text || (nextval('education_board_subject_seq'::regclass))::text),
    "education_board_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "max_mark" DECIMAL(6,2) NOT NULL,
    "pass_mark" DECIMAL(6,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "education_board_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_boards_grade" ON "education_boards"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "education_boards_name_grade_key" ON "education_boards"("name", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "education_boards_slug_key" ON "education_boards"("slug");

-- CreateIndex
CREATE INDEX "idx_board_subjects_board" ON "education_board_subjects"("education_board_id");

-- CreateIndex
CREATE UNIQUE INDEX "education_board_subjects_education_board_id_name_key" ON "education_board_subjects"("education_board_id", "name");

-- AddForeignKey
ALTER TABLE "education_board_subjects" ADD CONSTRAINT "education_board_subjects_education_board_id_fkey" FOREIGN KEY ("education_board_id") REFERENCES "education_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
