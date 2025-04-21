-- CreateTable
CREATE TABLE "log_archives" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "archiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "log_archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_archives_year_month_day_idx" ON "log_archives"("year", "month", "day");
