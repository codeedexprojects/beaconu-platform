-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "profile_sections" JSONB,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_slug_idx" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_status_idx" ON "universities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_university_id_idx" ON "colleges"("university_id");

-- CreateIndex
CREATE INDEX "colleges_slug_idx" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_status_idx" ON "colleges"("status");

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
