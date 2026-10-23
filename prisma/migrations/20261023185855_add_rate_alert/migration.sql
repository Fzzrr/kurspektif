-- CreateTable
CREATE TABLE "RateAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "triggeredAt" TIMESTAMP(3),
    "triggeredRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateAlert_userId_idx" ON "RateAlert"("userId");

-- CreateIndex
CREATE INDEX "RateAlert_triggeredAt_idx" ON "RateAlert"("triggeredAt");

-- AddForeignKey
ALTER TABLE "RateAlert" ADD CONSTRAINT "RateAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
