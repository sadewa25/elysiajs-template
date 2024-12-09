-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Article_user_id_idx" ON "Article"("user_id");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
