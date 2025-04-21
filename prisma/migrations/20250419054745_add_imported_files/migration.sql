-- CreateTable
CREATE TABLE "imported_files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "ossPath" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "imported_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imported_files" ADD CONSTRAINT "imported_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
