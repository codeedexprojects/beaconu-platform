-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "legal_document_seq";
CREATE SEQUENCE IF NOT EXISTS "college_legal_document_seq";

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL DEFAULT ('LGD-'::text || (nextval('legal_document_seq'::regclass))::text),
    "doc_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "document_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "effective_from" DATE,
    "published_at" TIMESTAMPTZ,
    "updated_by_admin_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_legal_documents" (
    "id" TEXT NOT NULL DEFAULT ('LGC-'::text || (nextval('college_legal_document_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "doc_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "document_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "effective_from" DATE,
    "published_at" TIMESTAMPTZ,
    "updated_by_staff_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_doc_type_key" ON "legal_documents"("doc_type");

-- CreateIndex
CREATE INDEX "idx_legal_docs_status" ON "legal_documents"("status");

-- CreateIndex
CREATE INDEX "idx_college_legal_docs_college" ON "college_legal_documents"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "college_legal_documents_college_id_doc_type_key" ON "college_legal_documents"("college_id", "doc_type");

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_updated_by_admin_id_fkey" FOREIGN KEY ("updated_by_admin_id") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_legal_documents" ADD CONSTRAINT "college_legal_documents_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_legal_documents" ADD CONSTRAINT "college_legal_documents_updated_by_staff_id_fkey" FOREIGN KEY ("updated_by_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

