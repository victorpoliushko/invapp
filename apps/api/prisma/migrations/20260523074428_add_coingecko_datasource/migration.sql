-- AlterEnum
ALTER TYPE "DataSource" ADD VALUE 'COINGECKO';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "coingeckoId" TEXT;
