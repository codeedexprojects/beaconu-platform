/*
  Warnings:

  - You are about to drop the column `platform_role_id` on the `platform_admins` table. All the data in the column will be lost.
  - You are about to drop the `platform_role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platform_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "platform_admins" DROP CONSTRAINT "platform_admins_platform_role_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_role_permissions" DROP CONSTRAINT "platform_role_permissions_platform_role_id_fkey";

-- DropIndex
DROP INDEX "idx_platform_admin_role";

-- AlterTable
ALTER TABLE "platform_admins" DROP COLUMN "platform_role_id";

-- DropTable
DROP TABLE "platform_role_permissions";

-- DropTable
DROP TABLE "platform_roles";
