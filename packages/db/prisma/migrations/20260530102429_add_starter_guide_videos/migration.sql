-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "starter_guide_video_seq";

-- CreateTable
CREATE TABLE "starter_guide_videos" (
    "id" TEXT NOT NULL DEFAULT ('SGV-'::text || (nextval('starter_guide_video_seq'::regclass))::text),
    "title" VARCHAR(255) NOT NULL,
    "video_key" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "starter_guide_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_sgv_is_active" ON "starter_guide_videos"("is_active");

-- CreateIndex
CREATE INDEX "idx_sgv_display_order" ON "starter_guide_videos"("display_order");
