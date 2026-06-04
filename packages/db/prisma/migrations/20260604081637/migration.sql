/*
  Warnings:

  - You are about to drop the column `student_id` on the `community_members` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `community_post_votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[community_id,member_type,member_id]` on the table `community_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[post_id,voter_id,voter_type]` on the table `community_post_votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author_type` to the `community_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `community_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_type` to the `community_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_id` to the `community_post_votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_type` to the `community_post_votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_type` to the `community_posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "community_comments" DROP CONSTRAINT "community_comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "community_members" DROP CONSTRAINT "community_members_student_id_fkey";

-- DropForeignKey
ALTER TABLE "community_post_votes" DROP CONSTRAINT "community_post_votes_student_id_fkey";

-- DropForeignKey
ALTER TABLE "community_posts" DROP CONSTRAINT "community_posts_author_id_fkey";

-- DropIndex
DROP INDEX "community_members_community_id_student_id_key";

-- DropIndex
DROP INDEX "idx_cmembers_student";

-- DropIndex
DROP INDEX "community_post_votes_post_id_student_id_key";

-- DropIndex
DROP INDEX "idx_votes_student";

-- AlterTable
ALTER TABLE "community_comments" ADD COLUMN     "author_type" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "community_members" DROP COLUMN "student_id",
ADD COLUMN     "member_id" TEXT NOT NULL,
ADD COLUMN     "member_type" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "community_post_votes" DROP COLUMN "student_id",
ADD COLUMN     "voter_id" TEXT NOT NULL,
ADD COLUMN     "voter_type" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "author_type" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_cmembers_member" ON "community_members"("member_type", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_community_id_member_type_member_id_key" ON "community_members"("community_id", "member_type", "member_id");

-- CreateIndex
CREATE INDEX "idx_votes_voter" ON "community_post_votes"("voter_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_post_votes_post_id_voter_id_voter_type_key" ON "community_post_votes"("post_id", "voter_id", "voter_type");
