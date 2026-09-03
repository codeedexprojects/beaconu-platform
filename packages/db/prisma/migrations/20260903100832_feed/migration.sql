-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "feed_seq";

-- CreateTable
CREATE TABLE "feeds" (
    "id" TEXT NOT NULL DEFAULT ('FED-'::text || (nextval('feed_seq'::regclass))::text),
    "caption" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "feeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_feed_is_active" ON "feeds"("is_active");

-- CreateIndex
CREATE INDEX "idx_feed_display_order" ON "feeds"("display_order");
