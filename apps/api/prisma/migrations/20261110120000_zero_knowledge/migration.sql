-- Amounts are now encrypted on the device; existing plaintext holdings are wiped.
TRUNCATE TABLE "StockTransaction", "CryptoTransaction", "StockPosition", "CryptoPosition", "BondTransaction", "Bond", "RealEstateTransaction", "RealEstate", "MixedAsset", "Cash";
UPDATE "Portfolio" SET "goal" = NULL;

ALTER TABLE "Portfolio" ALTER COLUMN "goal" SET DATA TYPE TEXT;

ALTER TABLE "RealEstate" ALTER COLUMN "purchasePrice" SET DATA TYPE TEXT,
ALTER COLUMN "currentValue" SET DATA TYPE TEXT;

ALTER TABLE "RealEstateTransaction" ALTER COLUMN "monthlyRent" SET DATA TYPE TEXT;

ALTER TABLE "StockPosition" ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE TEXT;

ALTER TABLE "CryptoPosition" ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE TEXT;

ALTER TABLE "MixedAsset" ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "purchasePrice" SET DATA TYPE TEXT,
ALTER COLUMN "currentValue" SET DATA TYPE TEXT;

ALTER TABLE "Cash" ALTER COLUMN "amount" SET DATA TYPE TEXT;

ALTER TABLE "StockTransaction" ALTER COLUMN "quantityChange" SET DATA TYPE TEXT,
ALTER COLUMN "pricePerUnit" SET DATA TYPE TEXT;

ALTER TABLE "CryptoTransaction" ALTER COLUMN "quantityChange" SET DATA TYPE TEXT,
ALTER COLUMN "pricePerUnit" SET DATA TYPE TEXT;

ALTER TABLE "Bond" ALTER COLUMN "faceValue" SET DATA TYPE TEXT,
ALTER COLUMN "couponRate" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "purchasePrice" DROP DEFAULT,
ALTER COLUMN "purchasePrice" SET DATA TYPE TEXT,
ALTER COLUMN "currentValue" SET DATA TYPE TEXT;

ALTER TABLE "BondTransaction" ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "pricePerUnit" SET DATA TYPE TEXT;

CREATE TABLE "UserVault" (
    "id" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "wrappedKey" TEXT NOT NULL,
    "recoverySalt" TEXT NOT NULL,
    "recoveryWrappedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserVault_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserVault_userId_key" ON "UserVault"("userId");

ALTER TABLE "UserVault" ADD CONSTRAINT "UserVault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
