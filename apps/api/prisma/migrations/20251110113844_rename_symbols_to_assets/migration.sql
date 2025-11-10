/*
  Warnings:

  - You are about to drop the `PortfolioSymbol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Symbol` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('BOND', 'CASH', 'COMMODITY', 'CRYPTOCURRENCY', 'ETF', 'MUTUALFUND', 'PRECIOUS_METAL', 'PRIVATE_EQUITY', 'Stock');

-- DropForeignKey
ALTER TABLE "PortfolioSymbol" DROP CONSTRAINT "PortfolioSymbol_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioSymbol" DROP CONSTRAINT "PortfolioSymbol_symbolId_fkey";

-- DropTable
DROP TABLE "PortfolioSymbol";

-- DropTable
DROP TABLE "Symbol";

-- DropEnum
DROP TYPE "SymbolType";

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "name" TEXT,
    "type" "AssetType",
    "exchange" TEXT,
    "dataSource" "DataSource",
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAsset" (
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,

    CONSTRAINT "PortfolioAsset_pkey" PRIMARY KEY ("portfolioId","assetId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_asset_key" ON "Asset"("asset");

-- AddForeignKey
ALTER TABLE "PortfolioAsset" ADD CONSTRAINT "PortfolioAsset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioAsset" ADD CONSTRAINT "PortfolioAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
