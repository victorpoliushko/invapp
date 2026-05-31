-- CreateEnum
CREATE TYPE "CouponFrequency" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "Bond" (
    "id" TEXT NOT NULL,
    "isin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "faceValue" DOUBLE PRECISION NOT NULL,
    "couponRate" DOUBLE PRECISION NOT NULL,
    "couponFrequency" "CouponFrequency" NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "Bond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BondTransaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bondId" TEXT NOT NULL,

    CONSTRAINT "BondTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bond" ADD CONSTRAINT "Bond_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BondTransaction" ADD CONSTRAINT "BondTransaction_bondId_fkey" FOREIGN KEY ("bondId") REFERENCES "Bond"("id") ON DELETE CASCADE ON UPDATE CASCADE;
