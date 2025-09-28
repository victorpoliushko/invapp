/*
  Warnings:

  - Added the required column `price` to the `Symbol` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Symbol` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Symbol` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SymbolType" AS ENUM ('BOND', 'CASH', 'COMMODITY', 'CRYPTOCURRENCY', 'ETF', 'MUTUALFUND', 'PRECIOUS_METAL', 'PRIVATE_EQUITY', 'Stock');

-- AlterTable
ALTER TABLE "PortfolioSymbol" ADD COLUMN     "avgBuyPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Symbol" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "SymbolType" NOT NULL;
