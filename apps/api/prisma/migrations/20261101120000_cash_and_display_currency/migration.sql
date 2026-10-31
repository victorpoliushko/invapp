-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultCurrency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "displayCurrency" TEXT;

-- CreateTable
CREATE TABLE "Cash" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "Cash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cash_portfolioId_idx" ON "Cash"("portfolioId");

-- AddForeignKey
ALTER TABLE "Cash" ADD CONSTRAINT "Cash_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
