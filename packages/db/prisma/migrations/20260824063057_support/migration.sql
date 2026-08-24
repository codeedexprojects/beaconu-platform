-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "platform_ticket_seq";
CREATE SEQUENCE IF NOT EXISTS "platform_ticket_message_seq";

-- CreateTable
CREATE TABLE "platform_tickets" (
    "id" TEXT NOT NULL DEFAULT ('PTK-'::text || (nextval('platform_ticket_seq'::regclass))::text),
    "ticket_number" VARCHAR(30) NOT NULL,
    "college_id" TEXT NOT NULL,
    "raised_by" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'query',
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "phone_number" VARCHAR(20),
    "preferred_time" VARCHAR(100),
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "assigned_to" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'awaiting_response',
    "resolved_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_ticket_messages" (
    "id" TEXT NOT NULL DEFAULT ('PTM-'::text || (nextval('platform_ticket_message_seq'::regclass))::text),
    "ticket_id" TEXT NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" TEXT,
    "message" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_tickets_ticket_number_key" ON "platform_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "idx_ptickets_college" ON "platform_tickets"("college_id");

-- CreateIndex
CREATE INDEX "idx_ptickets_raised_by" ON "platform_tickets"("raised_by");

-- CreateIndex
CREATE INDEX "idx_ptickets_status" ON "platform_tickets"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_ptickets_assigned" ON "platform_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_ptickets_number" ON "platform_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "idx_ptickets_type" ON "platform_tickets"("type");

-- CreateIndex
CREATE INDEX "idx_ptmsg_ticket" ON "platform_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_ptmsg_sender" ON "platform_ticket_messages"("sender_type", "sender_id");

-- AddForeignKey
ALTER TABLE "platform_tickets" ADD CONSTRAINT "platform_tickets_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_tickets" ADD CONSTRAINT "platform_tickets_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_tickets" ADD CONSTRAINT "platform_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_ticket_messages" ADD CONSTRAINT "platform_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "platform_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
