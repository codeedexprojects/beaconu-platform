-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "course_master_seq";

-- CreateTable
CREATE TABLE "course_masters" (
    "id" TEXT NOT NULL DEFAULT ('CRM-'::text || (nextval('course_master_seq'::regclass))::text),
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "discipline_id" TEXT NOT NULL,
    "study_level_id" TEXT,
    "program_type_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "course_masters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_course_masters_discipline" ON "course_masters"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_course_masters_study_level" ON "course_masters"("study_level_id");

-- CreateIndex
CREATE INDEX "idx_course_masters_program_type" ON "course_masters"("program_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_masters_discipline_id_slug_key" ON "course_masters"("discipline_id", "slug");

-- AddForeignKey
ALTER TABLE "course_masters" ADD CONSTRAINT "course_masters_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_masters" ADD CONSTRAINT "course_masters_study_level_id_fkey" FOREIGN KEY ("study_level_id") REFERENCES "study_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_masters" ADD CONSTRAINT "course_masters_program_type_id_fkey" FOREIGN KEY ("program_type_id") REFERENCES "program_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
