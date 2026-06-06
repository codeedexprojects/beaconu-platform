-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "community_comment_like_seq";

-- CreateTable
CREATE TABLE "community_comment_likes" (
    "id" TEXT NOT NULL DEFAULT ('CCL-'::text || (nextval('community_comment_like_seq'::regclass))::text),
    "comment_id" TEXT NOT NULL,
    "liker_id" TEXT NOT NULL,
    "liker_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_comment_like" ON "community_comment_likes"("comment_id", "liker_id", "liker_type");

-- CreateIndex
CREATE INDEX "idx_clikes_comment" ON "community_comment_likes"("comment_id");

-- CreateIndex
CREATE INDEX "idx_clikes_liker" ON "community_comment_likes"("liker_id");

-- AddForeignKey
ALTER TABLE "community_comment_likes" ADD CONSTRAINT "community_comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
