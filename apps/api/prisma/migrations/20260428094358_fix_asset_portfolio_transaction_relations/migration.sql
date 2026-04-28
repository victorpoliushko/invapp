-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_portfolioId_fkey";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_assetId_fkey" FOREIGN KEY ("portfolioId", "assetId") REFERENCES "PortfolioAsset"("portfolioId", "assetId") ON DELETE RESTRICT ON UPDATE CASCADE;
