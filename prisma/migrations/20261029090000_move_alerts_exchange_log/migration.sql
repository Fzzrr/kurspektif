-- AlterTable
ALTER TABLE "User" ADD COLUMN     "moveAlerts" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "WatchedPair" ADD COLUMN     "lastMoveDate" TEXT;

-- CreateTable
CREATE TABLE "ExchangeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "midRate" DOUBLE PRECISION NOT NULL,
    "midDate" TEXT NOT NULL,
    "place" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExchangeRecord_userId_date_idx" ON "ExchangeRecord"("userId", "date");

-- AddForeignKey
ALTER TABLE "ExchangeRecord" ADD CONSTRAINT "ExchangeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
