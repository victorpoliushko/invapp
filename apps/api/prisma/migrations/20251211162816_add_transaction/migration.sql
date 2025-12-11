-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantityChange" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_id_portfolioId_assetId_idx" ON "Transaction"("id", "portfolioId", "assetId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
