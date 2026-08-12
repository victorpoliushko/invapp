/*
  Warnings:

  - You are about to drop the `MixedAssets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MixedAssets";

-- DropEnum
DROP TYPE "MixedAssetType";

-- CreateTable
CREATE TABLE "MixedAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentValue" DOUBLE PRECISION,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "MixedAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MixedAsset" ADD CONSTRAINT "MixedAsset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
