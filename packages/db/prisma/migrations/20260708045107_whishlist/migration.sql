-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "college_wishlist_seq";

-- CreateTable
CREATE TABLE "college_wishlists" (
    "id" TEXT NOT NULL DEFAULT ('CWL-'::text || (nextval('college_wishlist_seq'::regclass))::text),
    "student_id" TEXT NOT NULL,
    "college_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cwish_student" ON "college_wishlists"("student_id");

-- CreateIndex
CREATE INDEX "idx_cwish_college" ON "college_wishlists"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "college_wishlists_student_id_college_id_key" ON "college_wishlists"("student_id", "college_id");

-- AddForeignKey
ALTER TABLE "college_wishlists" ADD CONSTRAINT "college_wishlists_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_wishlists" ADD CONSTRAINT "college_wishlists_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
