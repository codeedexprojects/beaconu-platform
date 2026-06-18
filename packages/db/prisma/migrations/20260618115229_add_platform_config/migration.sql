-- CreateTable
CREATE TABLE "platform_configs" (
    "id" VARCHAR(20) NOT NULL DEFAULT 'default',
    "gst_percentage" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "counsellor_min_withdrawal_amount" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "updated_by_admin_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_configs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform_configs" ADD CONSTRAINT "platform_configs_updated_by_admin_id_fkey" FOREIGN KEY ("updated_by_admin_id") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default row
INSERT INTO "platform_configs" ("id", "updated_at") VALUES ('default', CURRENT_TIMESTAMP);
