-- CreateEnum
CREATE TYPE "CashCategory" AS ENUM ('GENERAL', 'STOCK', 'CRYPTO');

-- AlterTable
ALTER TABLE "Cash" ADD COLUMN     "category" "CashCategory" NOT NULL DEFAULT 'GENERAL';
