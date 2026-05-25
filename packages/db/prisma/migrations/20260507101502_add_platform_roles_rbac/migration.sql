-- AlterTable
ALTER TABLE "platform_admins" ADD COLUMN     "platform_role_id" UUID;

-- CreateTable
CREATE TABLE "platform_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform_role_id" UUID NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_roles_slug_key" ON "platform_roles"("slug");

-- CreateIndex
CREATE INDEX "idx_platform_role_perms_role" ON "platform_role_permissions"("platform_role_id");

-- CreateIndex
CREATE INDEX "idx_platform_role_perms_code" ON "platform_role_permissions"("permission_code");

-- CreateIndex
CREATE UNIQUE INDEX "platform_role_permissions_platform_role_id_permission_code_key" ON "platform_role_permissions"("platform_role_id", "permission_code");

-- CreateIndex
CREATE INDEX "idx_platform_admin_role" ON "platform_admins"("platform_role_id");

-- AddForeignKey
ALTER TABLE "platform_admins" ADD CONSTRAINT "platform_admins_platform_role_id_fkey" FOREIGN KEY ("platform_role_id") REFERENCES "platform_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_role_permissions" ADD CONSTRAINT "platform_role_permissions_platform_role_id_fkey" FOREIGN KEY ("platform_role_id") REFERENCES "platform_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
