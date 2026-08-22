/*
  Warnings:

  - You are about to drop the `starter_guide_videos` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "institute_of_national_importance_seq";
CREATE SEQUENCE IF NOT EXISTS "starter_guide_seq";
CREATE SEQUENCE IF NOT EXISTS "short_seq";
CREATE SEQUENCE IF NOT EXISTS "video_testimonial_seq";

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN IF NOT EXISTS "institute_of_national_importance_id" TEXT;

-- DropTable
DROP TABLE IF EXISTS "starter_guide_videos";

-- CreateTable
CREATE TABLE "institutes_of_national_importance" (
    "id" TEXT NOT NULL DEFAULT ('INI-'::text || (nextval('institute_of_national_importance_seq'::regclass))::text),
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "icon_url" TEXT,
    "colleges_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "institutes_of_national_importance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starter_guides" (
    "id" TEXT NOT NULL DEFAULT ('SG-'::text || (nextval('starter_guide_seq'::regclass))::text),
    "title" VARCHAR(255) NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "starter_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shorts" (
    "id" TEXT NOT NULL DEFAULT ('SHT-'::text || (nextval('short_seq'::regclass))::text),
    "title" VARCHAR(255) NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "shorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_testimonials" (
    "id" TEXT NOT NULL DEFAULT ('VTM-'::text || (nextval('video_testimonial_seq'::regclass))::text),
    "title" VARCHAR(255) NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "student_image_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "video_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutes_of_national_importance_name_key" ON "institutes_of_national_importance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "institutes_of_national_importance_slug_key" ON "institutes_of_national_importance"("slug");

-- CreateIndex
CREATE INDEX "idx_ini_active" ON "institutes_of_national_importance"("is_active");

-- CreateIndex
CREATE INDEX "idx_sg_is_active" ON "starter_guides"("is_active");

-- CreateIndex
CREATE INDEX "idx_sg_display_order" ON "starter_guides"("display_order");

-- CreateIndex
CREATE INDEX "idx_shorts_is_active" ON "shorts"("is_active");

-- CreateIndex
CREATE INDEX "idx_shorts_display_order" ON "shorts"("display_order");

-- CreateIndex
CREATE INDEX "idx_vtm_is_active" ON "video_testimonials"("is_active");

-- CreateIndex
CREATE INDEX "idx_vtm_display_order" ON "video_testimonials"("display_order");

-- CreateIndex
CREATE INDEX "idx_colleges_ini" ON "colleges"("institute_of_national_importance_id");

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_institute_of_national_importance_id_fkey" FOREIGN KEY ("institute_of_national_importance_id") REFERENCES "institutes_of_national_importance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
