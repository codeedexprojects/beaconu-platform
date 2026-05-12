-- CreateTable
CREATE TABLE "institution_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "group_code" VARCHAR(30) NOT NULL,
    "created_by_college_id" UUID NOT NULL,
    "created_by_staff_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "institution_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',
    "joined_via" VARCHAR(20) NOT NULL DEFAULT 'code',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institution_groups_slug_key" ON "institution_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "institution_groups_group_code_key" ON "institution_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_ig_slug" ON "institution_groups"("slug");

-- CreateIndex
CREATE INDEX "idx_ig_group_code" ON "institution_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_ig_status" ON "institution_groups"("status");

-- CreateIndex
CREATE INDEX "idx_ig_created_by_college" ON "institution_groups"("created_by_college_id");

-- CreateIndex
CREATE UNIQUE INDEX "institution_group_members_college_id_key" ON "institution_group_members"("college_id");

-- CreateIndex
CREATE INDEX "idx_igm_group" ON "institution_group_members"("group_id");

-- CreateIndex
CREATE INDEX "idx_igm_college" ON "institution_group_members"("college_id");

-- CreateIndex
CREATE INDEX "idx_igm_role" ON "institution_group_members"("role");

-- AddForeignKey
ALTER TABLE "institution_groups" ADD CONSTRAINT "institution_groups_created_by_college_id_fkey" FOREIGN KEY ("created_by_college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_groups" ADD CONSTRAINT "institution_groups_created_by_staff_id_fkey" FOREIGN KEY ("created_by_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_group_members" ADD CONSTRAINT "institution_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "institution_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_group_members" ADD CONSTRAINT "institution_group_members_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
