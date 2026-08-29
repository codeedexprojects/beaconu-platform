-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "site_announcement_seq";

-- CreateTable
CREATE TABLE "site_announcements" (
    "id" TEXT NOT NULL DEFAULT ('SAN-'::text || (nextval('site_announcement_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "link" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_site_announce_college" ON "site_announcements"("college_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_site_announce_date" ON "site_announcements"("date" DESC);

-- AddForeignKey
ALTER TABLE "site_announcements" ADD CONSTRAINT "site_announcements_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
