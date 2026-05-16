-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "currentPrice" DOUBLE PRECISION,
ADD COLUMN     "priceUpdatedAt" TIMESTAMP(3);
