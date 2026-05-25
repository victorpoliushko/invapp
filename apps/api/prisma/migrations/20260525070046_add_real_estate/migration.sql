-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('APARTMENT', 'HOUSE', 'COMMERCIAL');

-- CreateTable
CREATE TABLE "RealEstate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RealEstateType" NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "occupancyPct" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "RealEstate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RealEstate" ADD CONSTRAINT "RealEstate_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
