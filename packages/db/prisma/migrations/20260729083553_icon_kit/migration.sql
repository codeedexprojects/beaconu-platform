-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS icon_seq;

-- CreateTable
CREATE TABLE "icons" (
    "id" TEXT NOT NULL DEFAULT ('ICN-'::text || (nextval('icon_seq'::regclass))::text),
    "name" VARCHAR(150) NOT NULL,
    "icon_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "icons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "icons_name_key" ON "icons"("name");

-- CreateIndex
CREATE INDEX "idx_icons_active" ON "icons"("is_active");
