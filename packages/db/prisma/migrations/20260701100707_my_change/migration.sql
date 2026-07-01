-- DropForeignKey
ALTER TABLE "campus_visits" DROP CONSTRAINT "campus_visits_ambassador_id_fkey";

-- AddForeignKey
ALTER TABLE "campus_visits" ADD CONSTRAINT "campus_visits_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "blink_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
