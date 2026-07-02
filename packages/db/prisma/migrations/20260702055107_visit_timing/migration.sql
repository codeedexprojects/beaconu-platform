-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "campus_visit_availability_seq";

-- CreateTable
CREATE TABLE "campus_visit_availability" (
    "id" TEXT NOT NULL DEFAULT ('CVA-'::text || (nextval('campus_visit_availability_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME,
    "max_capacity" INTEGER NOT NULL DEFAULT 1,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "is_off" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campus_visit_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_visit_availability_date" ON "campus_visit_availability"("college_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "campus_visit_availability_college_id_date_key" ON "campus_visit_availability"("college_id", "date");

-- AddForeignKey
ALTER TABLE "campus_visit_availability" ADD CONSTRAINT "campus_visit_availability_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
